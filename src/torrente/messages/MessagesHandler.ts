import axios from 'axios';
import WebSocket from "ws";
import { PAYFLUXO_USING_PORT } from "../../config";
import { startPayfluxoServer } from "../../payment/connections/PayfluxoServer";
import { SessionController } from "../../payment/controllers/SessionController";
import { SessionLoader } from '../../payment/data/SessionLoader';
import { SessionSaver } from '../../payment/data/SessionSaver';
import { MicropaymentRequest } from "../../payment/models/MicropaymentRequest";
import { DownloadDeclarationIntentionStatusEnum } from '../../torrente/notification/NotificationHandler';
import { tryNatTraversal } from "../NatTraversalHandler";
import { NotificationHandler } from "../notification/NotificationHandler";
import { IAuthenticatedMessageData } from "./models/AuthenticatedMessage";
import { IDownloadedBlockMessageData } from "./models/DownloadedBlockMessage";
import { IDownloadIntentionMessageData } from './models/DownloadIntentionMessage';
import { MessagesTypesEnum } from "./models/MessageModel";

export class MessagesHandler {
    torrenteConnection: WebSocket;
    sessionController: SessionController;
    notificationHandler: NotificationHandler;

    constructor(ws: WebSocket, notificationHandler: NotificationHandler) {
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
            case MessagesTypesEnum.DownloadIntention:
                this.handleDownloadIntention(messageObject['data']);
                break;
            case MessagesTypesEnum.RedeemValues:
                this.handleRedeemValues();
                break;
            case MessagesTypesEnum.RefreshWallet:
                this.handleRefreshWallet();
                break;
            default:
                break;
        }
    }

    private handleRedeemValues = async () => {
        const redeemPromises = Object.values(this.sessionController.receivingListeners).map(receiverListener => {
            try{
                this.sessionController.handleRedeemValues(receiverListener);
            }
            catch{
                console.log(`[ERROR] Couldn't redeem values for receiverlistener ${receiverListener.commitment.commitment_hash}`);
            }
        });
        await Promise.all(redeemPromises);
        console.log("[DEBUG] Redeem values requested");

        this.handleRefreshWallet();
    }

    private handleRefreshWallet = async () => {
        console.log("[DEBUG] Wallet refresh notified");
        try{
            const accountWallet = await this.sessionController.getWallet();
    
            this.notificationHandler.notifyWalletRefresh(accountWallet);
        }
        catch{
            console.log("[ERROR] Couldn't fetch wallet state");
        }
    }

    private handleDownloadIntention = async (data: IDownloadIntentionMessageData) => {
        let declarationId = this.sessionController.downloadDeclarationIntentions[data.magneticLink];
        const isValid = await this.sessionController.isIntentionValid(declarationId);
        if (isValid) {
            try {
                const paymentIntention = await this.declareNewPaymentIntention(data);
                declarationId = paymentIntention.id;
                if (!!declarationId) {
                    this.notificationHandler.notifyDownloadDeclarationIntentionStatus(data.torrentId,
                        DownloadDeclarationIntentionStatusEnum.SUCCESS);
                }
                else {
                    console.log("[INFO] Download intention declaration succeded")
                    this.notificationHandler.notifyDownloadDeclarationIntentionStatus(
                        data.torrentId,
                        DownloadDeclarationIntentionStatusEnum.NO_FUNDS
                    );
                }
            }
            catch{
                console.log("[ERROR] No funds to declare download intention")
                this.notificationHandler.notifyDownloadDeclarationIntentionStatus(
                    data.torrentId,
                    DownloadDeclarationIntentionStatusEnum.NO_FUNDS
                );
            }
        }
        
        
    }

    private handleDownloadedBlock = async (data: IDownloadedBlockMessageData) => {
        const peerEndpoint = `http://${data.uploaderIp}:${PAYFLUXO_USING_PORT}`;
        const uploaderHash = `${data.magneticLink}@${data.uploaderIp}`
        var uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
        if (!uploaderToPay) {
            try{
                const certificateResponse = await axios.get(`${peerEndpoint}/certificate`);
                const uploaderCertificate = certificateResponse.data['certificate'];
                const declarationId = this.sessionController.downloadDeclarationIntentions[data.magneticLink];
                this.sessionController.addpaymentHandlers(data.uploaderIp, uploaderCertificate, data.fileSize, data.magneticLink, declarationId);
                uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
                try {
                    const commitmentResponse = await axios.post(`${peerEndpoint}/commit`, uploaderToPay.commitment.commitmentMessage);
                }
                catch{
                    console.log(`[ERROR] Peer ${data.uploaderIp} didn't accept commit message`);
                    return;
                }
            }
            catch{
                console.log(`[ERROR] Peer ${data.uploaderIp} maybe is not Torrente`);
                return;
            }
        }
        const [hashLinkToPay, hashLinkIndex] = uploaderToPay.payHash();
        const paymentMessage: MicropaymentRequest = {
            hashLink: hashLinkToPay,
            hashLinkIndex: hashLinkIndex,
            magneticLink: data.magneticLink
        }

        try {
            const paymentResponse = await axios.post(`${peerEndpoint}/pay`, paymentMessage);
            console.log(`[INFO] Paid ip ${data.uploaderIp} for a block from torrent ${data.magneticLink}`)
        } catch (e) {
            console.log(`[ERROR] Payment not accepted from ${data.uploaderIp}: ${e}`)
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
        if (this.sessionController) {
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

    private declareNewPaymentIntention = async (data: IDownloadIntentionMessageData ) => {
        const piecePrice = await this.sessionController.paymentIntentionContract.queryGetPiecePrice();
        const paymentIntention = await this.sessionController.paymentIntentionContract.invokeCreatePaymentIntention(
            data.magneticLink,
            data.piecesNumber * piecePrice
        );
        if (paymentIntention.id) {
            this.sessionController.downloadDeclarationIntentions[data.magneticLink] = paymentIntention.id;
        }

        return paymentIntention;
    }
}