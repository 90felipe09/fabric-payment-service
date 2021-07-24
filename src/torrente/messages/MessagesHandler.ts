import axios from 'axios';
import WebSocket from "ws";
import { PAYFLUXO_USING_PORT } from "../../config";
import { startPayfluxoServer } from "../../payment/connections/PayfluxoServer";
import { SessionController } from "../../payment/controllers/SessionController";
import { SessionLoader } from '../../payment/data/SessionLoader';
import { SessionSaver } from '../../payment/data/SessionSaver';
import { MicropaymentRequest } from "../../payment/models/MicropaymentRequest";
import { TorrenteWallet } from '../../payment/models/TorrenteWallet';
import { tryNatTraversal } from "../NatTraversalHandler";
import { NotificationHandler } from "../notification/NotificationHandler";
import { IAuthenticatedMessageData } from "./models/AuthenticatedMessage";
import { IDownloadedBlockMessageData } from "./models/DownloadedBlockMessage";
import { IDownloadIntentionMessageData } from './models/DownloadIntentionMessage';
import { MessagesTypesEnum } from "./models/MessageModel";
import { HYPERLEDGER_IP, HYPERLEDGER_PORT } from '../../hyperledger/config';
import { DownloadDeclarationIntentionStatusEnum } from '../../torrente/notification/NotificationHandler'
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
        // TODO: Invoke redeem smart contract
        console.log("[DEBUG] Redeem values requested");

        this.handleRefreshWallet();
    }

    private handleRefreshWallet = async () => {
        console.log("[DEBUG] Wallet refresh notified");
        // MOCK
        const mockedWallet: TorrenteWallet = {
            available: Math.random() * 5,
            frozen: Math.random() * 5,
            redeemable: Math.random() * 5
        }
        // END MOCK

        this.notificationHandler.notifyWalletRefresh(mockedWallet);
    }

    private handleDownloadIntention = async (data: IDownloadIntentionMessageData) => {
        let declarationId = this.sessionController.downloadDeclarationIntentions[data.magneticLink];
        const isValid = await this.sessionController.isIntentionValid(declarationId);
        if (isValid) {
            const paymentIntention = await this.declareNewPaymentIntention(data);
            declarationId = paymentIntention.id;
        }
        if (!!declarationId) {
            this.notificationHandler.notifyDownloadDeclarationIntentionStatus(data.torrentId,
                DownloadDeclarationIntentionStatusEnum.SUCCESS);
        } else {
            this.notificationHandler.notifyDownloadDeclarationIntentionStatus(
                data.torrentId,
                DownloadDeclarationIntentionStatusEnum.NO_FUNDS
            );
        }
    }

    private handleDownloadedBlock = async (data: IDownloadedBlockMessageData) => {
        const peerEndpoint = `http://${data.uploaderIp}:${PAYFLUXO_USING_PORT}`;
        const uploaderHash = `${data.magneticLink}@${data.uploaderIp}`
        var uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
        if (!uploaderToPay) {
            const certificateResponse = await axios.get(`${peerEndpoint}/certificate`);
            const uploaderCertificate = certificateResponse.data['certificate'];
            const declarationId = this.sessionController.downloadDeclarationIntentions[data.magneticLink];
            this.sessionController.addpaymentHandlers(data.uploaderIp, uploaderCertificate, data.fileSize, data.magneticLink, declarationId);
            uploaderToPay = this.sessionController.paymentHandlers[uploaderHash]
            const commitmentResponse = await axios.post(`${peerEndpoint}/commit`, uploaderToPay.commitment.commitmentMessage);
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
        // Get piece price
        const paymentIntention = await this.sessionController.paymentIntentionContract.invokeCreatePaymentIntention(
            data.magneticLink,
            data.piecesNumber // Multiply this by the piece price retrieved
        );
        if (paymentIntention.id) {
            this.sessionController.downloadDeclarationIntentions[data.magneticLink] = paymentIntention.id;
        }

        return paymentIntention;
    }
}