import { assert } from 'console';
import WebSocket from 'ws'
import { TORRENTE_NOTIFICATION_PORT } from '../../config';
import { UserIdentification } from '../../payment/models/UserIdentification';
import { AuthenticatedMessage, IAuthenticatedMessageData } from '../messages/models/AuthenticatedMessage';
import { IClosingMessageData } from '../messages/models/ClosingMessage';
import { IDownloadedBlockMessageData } from '../messages/models/DownloadedBlockMessage';
import { IDownloadIntentionMessageData } from '../messages/models/DownloadIntentionMessage';
import { ILogoutMessageData, LogoutMessage } from '../messages/models/LogoutMessage';
import { IMessagesModel, MessagesTypesEnum } from '../messages/models/MessageModel';
import { IRedeemValuesMessageData } from '../messages/models/RedeemValuesMessage';
import { IRefreshWalletMessageData } from '../messages/models/RefreshWalletMessage';

export class TorrenteInterfaceSimulator {
    torrenteSocket: WebSocket

    public constructor() { 
        this.initConnection();
        this.torrenteSocket.onopen = this.onOpen;
        this.torrenteSocket.onmessage = this.onMessage;
        this.torrenteSocket.onclose = this.onClose;
        this.torrenteSocket.onerror = this.onError;
    }

    private initConnection = () => {
        this.torrenteSocket = new WebSocket(`ws://127.0.0.1:${TORRENTE_NOTIFICATION_PORT}`);
    }

    public close = () => {
        const closeMessage: IMessagesModel<IClosingMessageData> = {
            data: {
                message: "closing"
            },
            type: MessagesTypesEnum.Closing
        }
        const closeString = JSON.stringify(closeMessage)
        this.torrenteSocket.send(closeString);
    }

    public logout = () => {
        const logoutMessage: IMessagesModel<ILogoutMessageData> = {
            data: {
                message: "Logging out"
            },
            type: MessagesTypesEnum.Logout
        }
        const logoutString = JSON.stringify(logoutMessage)
        this.torrenteSocket.send(logoutString)
    }

    public redeem = () => {
        const redeemMessage: IMessagesModel<IRedeemValuesMessageData> = {
            data: {
                message: "Redeem"
            },
            type: MessagesTypesEnum.RedeemValues
        }
        const redeemString = JSON.stringify(redeemMessage);
        this.torrenteSocket.send(redeemString)
    }

    public downloadIntention = (downloadData: IDownloadIntentionMessageData) => {
        const downloadIntentionMessage: IMessagesModel<IDownloadIntentionMessageData> = {
            data: downloadData,
            type: MessagesTypesEnum.DownloadIntention
        }
        const downloadIntentionString = JSON.stringify(downloadIntentionMessage);
        this.torrenteSocket.send(downloadIntentionString)
    }

    public refreshWallet = () => {
        const refreshWalletMessage: IMessagesModel<IRefreshWalletMessageData> = {
            data: {
                message: "Refresh wallet"
            },
            type: MessagesTypesEnum.RefreshWallet
        }
        const refreshWalletString = JSON.stringify(refreshWalletMessage)
        this.torrenteSocket.send(refreshWalletString)
    }

    public authenticate = (userId: UserIdentification) => {
        const authData: IMessagesModel<IAuthenticatedMessageData> = {
            data: {
                certificate: userId.certificate,
                privateKey: userId.privateKey,
                mspId: userId.orgMSPID
            },
            type: MessagesTypesEnum.Authenticated
        }
        const authString = JSON.stringify(authData)
        this.torrenteSocket.send(authString);
    }

    public downloadBlock = (uploaderIp: string) => {
        const downloadBlockData: IMessagesModel<IDownloadedBlockMessageData> = {
            data: {
                fileSize: 15,
                magneticLink: "testdownload",
                uploaderIp: uploaderIp
            },
            type: MessagesTypesEnum.DownloadedBlock
        }
        const downloadBlockString = JSON.stringify(downloadBlockData);
        this.torrenteSocket.send(downloadBlockString)
    }

    private onOpen = (event) => {
        console.log("[INFO] Connected to Payfluxo");
    }

    private onMessage = (event: WebSocket.MessageEvent) => {
        console.log(event.data)
    }

    private onClose = (event) => {
        console.log("Disconnected from Payfluxo")
    }

    private onError = (event) => {
        console.log(event)
    }
}

