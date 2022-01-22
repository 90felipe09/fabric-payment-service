import express from 'express';
import http from 'http';
import { UserIdentification } from '../../payment/models/UserIdentification';
import { ConnectionController } from '../ConnectionController';
import { IDownloadIntentionMessageData } from '../messages/models/DownloadIntentionMessage';
import { DownloadDeclarationIntentionStatusEnum, NotificationHandler } from '../notification/NotificationHandler';
import { messagesHandlerMock } from './MessagesHandlerMock';
import { TorrenteInterfaceSimulator } from './TorrenteInterfaceSimulator';


const delay = ms => new Promise(res => setTimeout(res, ms));

jest.setTimeout(30000)

describe("test ConnectionController class", () => {
    const app = express();
    const server = http.createServer(app);
    var con = new ConnectionController;

    con.openConnection(messagesHandlerMock)

    const identificationExample: UserIdentification = {
        certificate: "-----BEGIN CERTIFICATE-----\nMIICljCCAjygAwIBAgIUcVFiuJI0IlYyvzwrzp1tl8KL9AswCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIxMTExMzE4MjAwMFoXDTIyMTExMzE5MzcwMFowTTEcMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDEtMCsGA1UEAxMkNDc4MDk0YjYtMzlj\nOC00MDMwLWIxODctNmEyNWE5YTJkZDJjMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAEW1Yx4YqWj17szSa7YsNRXSTh50xVry/FXxPdmVLySscEAYSgY62MWnIm8gD0\ntCsKYuHs2P1j7e7Nc5SxbjvWPKOB3jCB2zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUdWPmenLn4ShDvU3rEfjOhG61fe8wHwYDVR0jBBgw\nFoAUkPvuAV9ce5BMHU8yHVwNsXYMQqgwewYIKgMEBQYHCAEEb3siYXR0cnMiOnsi\naGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElEIjoiNDc4MDk0\nYjYtMzljOC00MDMwLWIxODctNmEyNWE5YTJkZDJjIiwiaGYuVHlwZSI6ImNsaWVu\ndCJ9fTAKBggqhkjOPQQDAgNIADBFAiEAv4q7FX4iyhpP4WPPwliX9qVLQCA22Pr1\nPj8fM40rMBACIDSEpKAan2GkJVNYnOe03FN2tytm9UJREkyJ2FWUo1u+\n-----END CERTIFICATE-----\n",
        privateKey: "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgF8UUnnRu4LJGr06y\r\n8Kdq6Opy9nHYD+pIRt7xtv9IZO6hRANCAARbVjHhipaPXuzNJrtiw1FdJOHnTFWv\r\nL8VfE92ZUvJKxwQBhKBjrYxacibyAPS0Kwpi4ezY/WPt7s1zlLFuO9Y8\r\n-----END PRIVATE KEY-----\r\n",
        orgMSPID: "Org1MSP"
    }

    const downloadDataExample: IDownloadIntentionMessageData = {
        magneticLink: "TestmagneticLink",
        piecesNumber: 29,
        torrentId: "TorrentTestId"
    }

    var torrenteSimulator: TorrenteInterfaceSimulator;

    beforeEach((done) => {
        torrenteSimulator = new TorrenteInterfaceSimulator()
        torrenteSimulator.torrenteSocket.on("open", (ws) => {
            done();
        })
    })

    afterEach((done) => {
        torrenteSimulator.torrenteSocket.close();
        done();
    })
    
    it("should test MessagesHandler class.", async () => {
        torrenteSimulator.authenticate(identificationExample)
        torrenteSimulator.downloadBlock('127.0.0.1', 'magneticLinkTest', 15);
        torrenteSimulator.close();
        torrenteSimulator.downloadIntention(downloadDataExample);
        torrenteSimulator.logout();
        torrenteSimulator.redeem();
        torrenteSimulator.refreshWallet();
        await delay(4000);
    });

    it("should test NotificationHandler class", async(done) => {
        const notificationHandler = NotificationHandler.getInstance();
        notificationHandler.notifyConnection();
        notificationHandler.notifyDownloadDeclarationIntentionStatus('torrentIdTest', DownloadDeclarationIntentionStatusEnum.SUCCESS);
        notificationHandler.notifyNATIssue();
        notificationHandler.notifyPayment({
            blocksPaid: 1,
            magneticLink: 'magneticLinkTest',
            payerIp: '127.0.0.1'
        });
        notificationHandler.notifyWalletRefresh({
            available: 123,
            frozen: 234,
            redeemable: 345
        });
        await delay(4000);
        done();
    })
});