import { assert } from "console";
import { getAddress } from "../../payment/utils/userAddress";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { HyperledgerPaymentService } from "../HyperledgerPaymentService";

jest.setTimeout(20000)

describe("test SessionController class", () => {
    const identificationExample: IAuthenticatedMessageData = {
        certificate: "-----BEGIN CERTIFICATE-----\nMIIClTCCAjygAwIBAgIUWTbIqevnp0TFfBdw23diQgZg3IQwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIyMDExNzEzNTAwMFoXDTIzMDExNzE2MTYwMFowTTEcMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDEtMCsGA1UEAxMkMzRjYzJlNDUtNDk5\nNy00ZTM1LThkMDQtNWRhODk4MTI4OTMzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAEBMfHfF2guPQQvSbr2BX20R9n4k7mEv0EVRQ+Z6j/jHjpY+PEuDl2FRALK9Nt\nCw2/VgyCAI3ldHSTvVDfy/wtwaOB3jCB2zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUhlsocUgwJzzb17lFhdzkNJko9iEwHwYDVR0jBBgw\nFoAUAkP8m6+aODiZGM8MGgpsXDW68c0wewYIKgMEBQYHCAEEb3siYXR0cnMiOnsi\naGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElEIjoiMzRjYzJl\nNDUtNDk5Ny00ZTM1LThkMDQtNWRhODk4MTI4OTMzIiwiaGYuVHlwZSI6ImNsaWVu\ndCJ9fTAKBggqhkjOPQQDAgNHADBEAiBIMPPHsdCtmnhuy0AgWH7fcn7fuCxvSnLv\n048U6FkFiwIgVlQgl35zcOfudyUYJLh72ZM0mWRLHC/OAjNDZgSmi34=\n-----END CERTIFICATE-----\n",
        privateKey: "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgpXO5lsH+Nc9BUlwE\r\n3cznJg4E4/dVDHbO0qYH2Q1K0EahRANCAAQEx8d8XaC49BC9JuvYFfbRH2fiTuYS\r\n/QRVFD5nqP+MeOlj48S4OXYVEAsr020LDb9WDIIAjeV0dJO9UN/L/C3B\r\n-----END PRIVATE KEY-----\r\n",
        mspId: "Org1MSP"
    }

    const hyperledgerPaymentService = new HyperledgerPaymentService()

    beforeEach(async (done) => {
        await hyperledgerPaymentService.init(identificationExample);
        await hyperledgerPaymentService.waitTillInitialized();
        done();
    })

    afterEach((done) => {
        hyperledgerPaymentService.accountContract.close()
        hyperledgerPaymentService.redeemContract.close();
        hyperledgerPaymentService.paymentIntentionContract.close();
        done();
    })

    it("should start the Hyperledger payment service.", async (done) => {
        const accountId = getAddress(identificationExample.certificate);
        const accountData = await hyperledgerPaymentService.evaluateAccount(accountId);
        const piecePrice = await hyperledgerPaymentService.queryGetPiecePrice();
        const paymentIntetion = await hyperledgerPaymentService.invokeCreatePaymentIntention({
            magneticLink: "MagneticLinkTest",
            valueToFreeze: 2
        })
        const paymentIntentionRead = await hyperledgerPaymentService.invokeReadPaymentIntention(paymentIntetion.id);
        const newAccountData = await hyperledgerPaymentService.evaluateAccount(accountId);
        console.log(accountData);
        console.log(piecePrice);
        console.log(paymentIntentionRead);
        console.log(newAccountData);
        assert(parseFloat(newAccountData.balance) < parseFloat(newAccountData.balance))
        done();
    });
});
