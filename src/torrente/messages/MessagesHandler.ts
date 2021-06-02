import axios from 'axios';
import WebSocket from "ws";
import { PAYFLUXO_EXTERNAL_PORT } from "../../config";
import { startPayfluxoServer } from "../../payment/connections/PayfluxoServer";
import { SessionController } from "../../payment/controllers/SessionController";
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
            default:
                break;
        }
    }

    private handleDownloadedBlock = async (data: IDownloadedBlockMessageData) => {
        const peerEndpoint = `${data.uploaderIp}:${PAYFLUXO_EXTERNAL_PORT}`;
        const uploaderHash = `${data.magneticLink}@${data.uploaderIp}`
        // verifica se tem um payment handler para o torrent especificado e ip
        const uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
        // caso tenha, apenas aciona o payment handler e envia mais um hash para o ip:9003/pay
        // caso não tenha, envia requisição ao ip:9003/commitment
        if(!uploaderToPay){
            // verifica se tem o certificado do cara no cache
            // se não tiver, pede pelo certificado
            const certificateResponse = await axios.get(`${peerEndpoint}/key`);
            const uploaderCertificate = certificateResponse.data['certificate'];
            this.sessionController.addpaymentHandlers(data.uploaderIp, uploaderCertificate, data.fileSize, data.magneticLink);
            const uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
            const commitmentResponse = await axios.post(`${peerEndpoint}/commitment`, uploaderToPay.commitment.commitmentMessage);
        }
        const [hashLinkToPay, hashLinkIndex] = uploaderToPay.payHash();
        const paymentMessage: MicropaymentRequest = {
            hashLink: hashLinkToPay,
            hashLinkIndex: hashLinkIndex,
            magneticLink: data.magneticLink
        }

        await axios.post(`${peerEndpoint}/pay`, paymentMessage);
    }

    private handleAuthentication = (data: IAuthenticatedMessageData) => {
        this.sessionController = startPayfluxoServer(data.privateKey, data.certificate, data.orgMSP);
        tryNatTraversal().catch((err) => {
            console.log("[ERROR]: ", err.message) 
            this.notificationHandler.notifyNATIssue();
        });
        // load persistence
    }
}