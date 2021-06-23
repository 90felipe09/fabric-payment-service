import axios from 'axios';
import WebSocket from "ws";
import { PAYFLUXO_USING_PORT } from "../../config";
import { startPayfluxoServer } from "../../payment/connections/PayfluxoServer";
import { SessionController } from "../../payment/controllers/SessionController";
import { SessionLoader } from '../../payment/data/SessionLoader';
import { SessionSaver } from '../../payment/data/SessionSaver';
import { MicropaymentRequest } from "../../payment/models/MicropaymentRequest";
import { tryNatTraversal } from "../NatTraversalHandler";
import { NotificationHandler } from "../notification/NotificationHandler";
import { IAuthenticatedMessageData } from "./models/AuthenticatedMessage";
import { IDownloadedBlockMessageData } from "./models/DownloadedBlockMessage";
import { MessagesTypesEnum } from "./models/MessageModel";

export class MessagesHandler{
    torrenteConnection: WebSocket;
    sessionController: SessionController;
    notificationHandler: NotificationHandler;

    constructor(ws: WebSocket, notificationHandler: NotificationHandler){
        this.torrenteConnection = ws;
        this.notificationHandler = notificationHandler;
    }

    public handleMessage = (message: string) => {
        const messageObject = JSON.parse(message);
        switch (messageObject['type']) {
            case MessagesTypesEnum.DownloadedBlock:
                this.handleDownloadedBlock(messageObject['data']);
                break;
            case MessagesTypesEnum.Authenticated:
                this.handleAuthentication(messageObject['data'])
                break;
            case MessagesTypesEnum.Logout:
                this.handleLogout();
                break;
            case MessagesTypesEnum.Closing:
                this.handleClosing();
                break;
            default:
                break;
        }
    }

    private handleDownloadedBlock = async (data: IDownloadedBlockMessageData) => {
        const peerEndpoint = `http://${data.uploaderIp}:${PAYFLUXO_USING_PORT}`;
        const uploaderHash = `${data.magneticLink}@${data.uploaderIp}`
        var uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
        if(!uploaderToPay){
            const certificateResponse = await axios.get(`${peerEndpoint}/certificate`);
            const uploaderCertificate = certificateResponse.data['certificate'];
            this.sessionController.addpaymentHandlers(data.uploaderIp, uploaderCertificate, data.fileSize, data.magneticLink);
            uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
            const commitmentResponse = await axios.post(`${peerEndpoint}/commit`, uploaderToPay.commitment.commitmentMessage);
        }
        const [hashLinkToPay, hashLinkIndex] = uploaderToPay.payHash();
        const paymentMessage: MicropaymentRequest = {
            hashLink: hashLinkToPay,
            hashLinkIndex: hashLinkIndex,
            magneticLink: data.magneticLink
        }

        try{
            const paymentResponse = await axios.post(`${peerEndpoint}/pay`, paymentMessage);
            console.log(`[INFO] Paid ip ${data.uploaderIp} for a block from torrent ${data.magneticLink}`)
        } catch (e){
            console.log(`[ERROR] Payment not accepted ${e}`)
        }
    }

    private handleAuthentication = (data: IAuthenticatedMessageData) => {
        this.sessionController = startPayfluxoServer(data.privateKey, data.certificate, data.mspId, this.notificationHandler);
        tryNatTraversal().catch((err) => {
            console.log("[ERROR]: ", err.message) 
            this.notificationHandler.notifyNATIssue();
        });

        SessionLoader.LoadSession(this.sessionController)
    }

    private handleClosing = () => {
        if (this.sessionController){
                SessionSaver.saveSession(this.sessionController);
                this.sessionController.closeServer();
        }
        
        process.exit();
    }

    private handleLogout = () => {
        SessionSaver.saveSession(this.sessionController);
        this.sessionController.closeServer();
        this.sessionController = undefined;
    }
}