import assert from "assert";
import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { ConnectionController } from "../../torrente/ConnectionController";
import { IDownloadIntentionMessageData } from "../../torrente/messages/models/DownloadIntentionMessage";
import { IntentionDeclaredNotification } from "../../torrente/notification/models/IntentionDeclaredNotification";
import { DownloadDeclarationIntentionStatusEnum } from "../../torrente/notification/NotificationHandler";
import { TorrenteInterfaceSimulator } from "../../torrente/tests/TorrenteInterfaceSimulator";
import { SessionController } from "../controllers/SessionController";
import { payfluxoMessagesHandler } from "../handlers/TorrenteMessagesHandler";
import { UserIdentification } from "../models/UserIdentification";


jest.setTimeout(40000);

describe("test DownloadDeclarationIntentionProtocol class", () => {
    var con = new ConnectionController;

    con.openConnection(payfluxoMessagesHandler)

    const identificationExample: UserIdentification = {
        certificate: "-----BEGIN CERTIFICATE-----\nMIIClTCCAjygAwIBAgIUWTbIqevnp0TFfBdw23diQgZg3IQwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIyMDExNzEzNTAwMFoXDTIzMDExNzE2MTYwMFowTTEcMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDEtMCsGA1UEAxMkMzRjYzJlNDUtNDk5\nNy00ZTM1LThkMDQtNWRhODk4MTI4OTMzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAEBMfHfF2guPQQvSbr2BX20R9n4k7mEv0EVRQ+Z6j/jHjpY+PEuDl2FRALK9Nt\nCw2/VgyCAI3ldHSTvVDfy/wtwaOB3jCB2zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUhlsocUgwJzzb17lFhdzkNJko9iEwHwYDVR0jBBgw\nFoAUAkP8m6+aODiZGM8MGgpsXDW68c0wewYIKgMEBQYHCAEEb3siYXR0cnMiOnsi\naGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElEIjoiMzRjYzJl\nNDUtNDk5Ny00ZTM1LThkMDQtNWRhODk4MTI4OTMzIiwiaGYuVHlwZSI6ImNsaWVu\ndCJ9fTAKBggqhkjOPQQDAgNHADBEAiBIMPPHsdCtmnhuy0AgWH7fcn7fuCxvSnLv\n048U6FkFiwIgVlQgl35zcOfudyUYJLh72ZM0mWRLHC/OAjNDZgSmi34=\n-----END CERTIFICATE-----\n",
        privateKey: "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgpXO5lsH+Nc9BUlwE\r\n3cznJg4E4/dVDHbO0qYH2Q1K0EahRANCAAQEx8d8XaC49BC9JuvYFfbRH2fiTuYS\r\n/QRVFD5nqP+MeOlj48S4OXYVEAsr020LDb9WDIIAjeV0dJO9UN/L/C3B\r\n-----END PRIVATE KEY-----\r\n",
        orgMSPID: "Org1MSP"
    }

    const downloadDataExample: IDownloadIntentionMessageData = {
        magneticLink: "TestmagneticLink",
        piecesNumber: 2,
        torrentId: "TorrentTestId"
    }

    var torrenteSimulator: TorrenteInterfaceSimulator;

    beforeEach(async (done) => {
        torrenteSimulator = new TorrenteInterfaceSimulator()
        await ConnectionController.waitUntillConnection();
        await torrenteSimulator.waitUntilOpen();
        done();
    })

    afterEach(async (done) => {
        torrenteSimulator.logout();
        torrenteSimulator.torrenteSocket.close();
        await torrenteSimulator.waitUntilClose();
        await SessionController.waitTillClosed();
        await PayfluxoServer.waitTillClosed();
        await ConnectionController.waitUntillDisconnection();
        done();
    })
    
    it("should test download declaration intention protocol.", async (done) => {
        torrenteSimulator.authenticate(identificationExample);
        await SessionController.waitTillInitialized();

        const sessionController = SessionController.getInstance();
        await sessionController.paymentService.waitTillInitialized();

        torrenteSimulator.downloadIntention(downloadDataExample);
        var endTest: (value?: unknown) => void;
        const testPromise = new Promise((resolve, _reject) => {endTest = resolve});
        const testPostNotification = async (message) => {
            const notificationObject: IntentionDeclaredNotification = JSON.parse(message.toString());
            assert(notificationObject.data.status === DownloadDeclarationIntentionStatusEnum.SUCCESS);
            const ddMap = sessionController.downloadDeclarationIntentions;
            assert(Object.values(ddMap).length != 0)
            const intentionPromises = Object.values(ddMap).map(async (ddid) => {
                const paymentIntention = await sessionController.paymentService.invokeReadPaymentIntention(ddid)
                console.log(paymentIntention);
            });
            await Promise.all(intentionPromises);
            endTest();
        }
        torrenteSimulator.torrenteSocket.on("message", testPostNotification)
        await testPromise;
        done();
    });
});

