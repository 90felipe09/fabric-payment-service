import express from 'express';
import http from 'http';
import { ConnectionController } from '../ConnectionController';
import { IAuthenticationMessageData } from '../messages/models/AuthenticationMessage';
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

    const credentialsExample: IAuthenticationMessageData = {
        "encrypted_content":"wlp1ZMDffmqIuTFOmVpSftf+Gbjt3qvgUVbdfYoHsrxzaQk4zkVMAsIHZ3QoWiMrcbZMg506phs/CHkt7UiPzFWy8tq8uS+tuRUb6+QvW/7GItmkP0AKaQ8RA013scoUsjrs2IhRK2zhwpQa2Rl237Bn8jJ8z2KY6WyI9eK1lead4+1fVF2If46Pe8ryVJfxB9SRzKOAX4lcJp839J9e1hKosbqweSYK2kjt4LTn5unLKt5A7oukSHMcSqrxMhuGZstNpZ8cXRHxaEgEGBtNsFyxlAmM4K0cga1xMeFFOOn8sKFQC6tLn7O3Wyg3NQjF1V+6Y29vtoz7D0mrgQumzzC3Pxg0/cMxoQq6QTTyG4DXxqBJu8FIIBQ3GXd5enpO9SEmcvKIMPfhP3wqRB3x0uAM7Udg/0oxvVcsABkzccVHHSDnkQOS4M7Mw4yAZ5WRV8aPnlJgY7uFaaw9Zk98UZxXZonFsKeUHqku9Vci62KUQL8vMBXrX/N+NCXzmT6LZE70capjfS4savbbePNouuUiQI31iG9Tu3J++XiCyEdCBt8dziEt6VeWj+WHoPNXmEVQc1E/iaJJFCha+YxjSaTwzcIFXgvFZ5aqATBODDZuvzcVoLhd0+UySI7BTVB7yQ18CHMJIDs7pEQ0BPe0UsWllEaSws6J8L4OjOEAo7NZSb+CTysZSshnz0YhGChBOAHfUGslDWysowz5UdjmX8dTDWrapO0a6becpmaSe7R7954twW5MDdsHdF4L3Ir2Y9JkEmA+Gdy6bbGkkRgIN7HIQLALoLT/0L3gNl0KmRqDfUrhVPXqQYyfsslnQ9n0kTSAv2HLTr/eglomysln49rvr/F1WY0U9htzvwH0c9pdD1s7UeZR4ioTVd2qRRD+5AHEp8hkWapnkipOSYwOkEgWGQu4Y5m2YQfc5K44TTDbEYP/pR2yE56ufx65rZlm+q/J/peLsne3/9/9UeTSD2XnuiEKo1wcoBmFSWfFuKUaEqvbyRuZT/GuNpUa+qCnFbIxoGdJbqjdS87UAwauPa3ys9WbuKGeyTdQG5DR8HerkfZNvj7s8uRk5+kMLEyR4LkIoH0TxPRZdm6XWEYmts5e4WWFF7AuNEkxDMI/ZUnj/zFsvDIfa5dggcVT2DYwQgsj2Sh/BHvNc1BFmRr0+itBMqtWSzOb9onpuIxvYJbXNeAaPSrJudeUlaSYPqvvcq07sY3qq32zqATJdkVTJU0MSES97/is9BmCrdN+iadPR2mIvRjyktYb8hS3hFYtqD7L1LWG1rnvtN7v1ytDQ/WCVuMoPEuX8bXti1BxXxCIrLAameEtdU3g3xX7MXYMrx9ttAHbirXEU/wWQD9cyFyd7M+26s9G8zMO2BDhaeM1h/EBwiMCUsBSez0okhXch01WHR3duM6HvcLlBZLKjAlJ57xTxpDdoEz5pvWfuZ827lLt02oCdR0ebaCoIhEfHBUnH2LU5RSYPKsHLP8tUP4xLOuvsWRJVLoYml3cid2PdmWn8wKJaZ8NYF9PTgdmCnvSZej9jGTsJv1s0wVXJngxE1inqT/oesEx0v0/35wUaLmh98zdCRj0Xb13MkPb7RegtbjsW/CgdZJUi+6Hmn6hT+CbsA7vjPtj6AQOP74bE7xu/9B6gMHaRDzYos7cR0yosxMh/fpFBHj70CowmgDrDypgqqxlUFZ5NsZJuXPRR2M=",
        "salt":"wGtpPMBXa9ri0NvHw6AIpg==",
        "password":"batata"
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
        torrenteSimulator.authenticate(credentialsExample)
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