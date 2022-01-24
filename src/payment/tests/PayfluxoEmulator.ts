import { createInterface } from "readline"
import { ConnectionController } from "../../torrente/ConnectionController"
import { TorrenteInterfaceSimulator } from "../../torrente/tests/TorrenteInterfaceSimulator"
import { payfluxoMessagesHandler } from "../handlers/TorrenteMessagesHandler"
import { UserIdentification } from "../models/UserIdentification"

console.log('Payfluxo - Torrente emulator')

const commandsInterface = createInterface({
    input: process.stdin,
    output: process.stdout
})

const askForCommand = (torrenteEmulator: TorrenteInterfaceSimulator) => {
    commandsInterface.question("> ", (value: string) => {
        commandReaction(value, torrenteEmulator);
    })
}

const identificationExample: UserIdentification = {
    certificate: "-----BEGIN CERTIFICATE-----\nMIIClTCCAjygAwIBAgIUWTbIqevnp0TFfBdw23diQgZg3IQwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIyMDExNzEzNTAwMFoXDTIzMDExNzE2MTYwMFowTTEcMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDEtMCsGA1UEAxMkMzRjYzJlNDUtNDk5\nNy00ZTM1LThkMDQtNWRhODk4MTI4OTMzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAEBMfHfF2guPQQvSbr2BX20R9n4k7mEv0EVRQ+Z6j/jHjpY+PEuDl2FRALK9Nt\nCw2/VgyCAI3ldHSTvVDfy/wtwaOB3jCB2zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUhlsocUgwJzzb17lFhdzkNJko9iEwHwYDVR0jBBgw\nFoAUAkP8m6+aODiZGM8MGgpsXDW68c0wewYIKgMEBQYHCAEEb3siYXR0cnMiOnsi\naGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElEIjoiMzRjYzJl\nNDUtNDk5Ny00ZTM1LThkMDQtNWRhODk4MTI4OTMzIiwiaGYuVHlwZSI6ImNsaWVu\ndCJ9fTAKBggqhkjOPQQDAgNHADBEAiBIMPPHsdCtmnhuy0AgWH7fcn7fuCxvSnLv\n048U6FkFiwIgVlQgl35zcOfudyUYJLh72ZM0mWRLHC/OAjNDZgSmi34=\n-----END CERTIFICATE-----\n",
    privateKey: "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgpXO5lsH+Nc9BUlwE\r\n3cznJg4E4/dVDHbO0qYH2Q1K0EahRANCAAQEx8d8XaC49BC9JuvYFfbRH2fiTuYS\r\n/QRVFD5nqP+MeOlj48S4OXYVEAsr020LDb9WDIIAjeV0dJO9UN/L/C3B\r\n-----END PRIVATE KEY-----\r\n",
    orgMSPID: "Org1MSP"
}

const commandReaction = (value: string, torrenteEmulator: TorrenteInterfaceSimulator) => {
    const commandWords = value.split(' ');
    switch (commandWords[0]){
        case 'authenticate':
            torrenteEmulator.authenticate(identificationExample);
            break;
        case 'close':
            process.exit();
            break;
        case 'logout':
            torrenteEmulator.logout();
            break;
        case 'intention':
            torrenteEmulator.downloadIntention({
                magneticLink: commandWords[2],
                piecesNumber: parseInt(commandWords[1]),
                torrentId: commandWords[2]
            })
            break;
        case 'downloaded':
            const blocksDownloaded = parseInt(commandWords[1])
            const fileSize = parseInt(commandWords[4])
            for (let index = 0; index < blocksDownloaded; index++) {
                torrenteEmulator.downloadBlock(
                    commandWords[2],
                    commandWords[3],
                    fileSize
                    )
            }
            break;
        case 'redeem':
            torrenteEmulator.redeem();
            break;
        case 'refresh':
            torrenteEmulator.refreshWallet();
            break;
        default:
            console.log('Unknown command!');
            break;
    }

    askForCommand(torrenteEmulator);
}

const emulate = async() => {
    var con = new ConnectionController;

    con.openConnection(payfluxoMessagesHandler)
    
    const torrenteSimulator = new TorrenteInterfaceSimulator()
    await ConnectionController.waitUntillConnection();
    await torrenteSimulator.waitUntilOpen();
    
    askForCommand(torrenteSimulator);
}

emulate();




