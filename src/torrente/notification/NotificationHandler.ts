import { PAYFLUXO_EXTERNAL_PORT, PAYFLUXO_LISTENING_PORT } from "../../config";
import { TorrenteWallet } from "../../payment/models/TorrenteWallet";
import { ConnectionController } from "../ConnectionController";
import { AuthenticationFailedNotification } from "./models/AuthenticationFailedNotification";
import { AuthenticationNotification } from "./models/AuthenticationNotification";
import { ConnectionNotification } from "./models/ConnectionNotification";
import { IntentionDeclaredNotification } from "./models/IntentionDeclaredNotification";
import { NATNotification } from "./models/NATNotification";
import { IPaymentNotifyData, PaymentNotification } from "./models/PaymentNotification";
import { WalletRefreshNotification } from "./models/WalletNotification";

export enum DownloadDeclarationIntentionStatusEnum {
    SUCCESS = 0,
    NO_FUNDS = 1
}

export class NotificationHandler {
    private static instance: NotificationHandler;

    public static getInstance = (): NotificationHandler => {
        if (!NotificationHandler.instance) {
            throw Error("NotificationHandler not initialized yet");
        }
        return NotificationHandler.instance;
    }

    constructor(){
        NotificationHandler.instance = this;
    }

    public notifyAuthenticationFailed() {
        const notificationObject = new AuthenticationFailedNotification()

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject())
        ConnectionController.getConnection().send(jsonNotification)
    }

    public notifyAuthentication(certificate: string, mspId: string) {
        const notificationObject = new AuthenticationNotification({
            certificate: certificate,
            orgMSPID: mspId
        })

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject())
        ConnectionController.getConnection().send(jsonNotification)
    }

    public notifyDownloadDeclarationIntentionStatus(torrentId: string, status: DownloadDeclarationIntentionStatusEnum) {
        const notificationObject = new IntentionDeclaredNotification({
            status: status,
            torrentId: torrentId
        })

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());
        ConnectionController.getConnection().send(jsonNotification);
    }

    public notifyNATIssue() {
        const notificationObject = new NATNotification({
            message: `Couldn't open port on NAT. Please, map internal port ${PAYFLUXO_LISTENING_PORT} to external port ${PAYFLUXO_EXTERNAL_PORT}`
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());        
        ConnectionController.getConnection().send(jsonNotification);
    }

    public notifyConnection() {
        const notificationObject = new ConnectionNotification({
            status: "connected"
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());          
        ConnectionController.getConnection().send(jsonNotification);
    }

    public notifyPayment(paymentNotificationData: IPaymentNotifyData){
        const notificationObject = new PaymentNotification(paymentNotificationData);

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());           
        ConnectionController.getConnection().send(jsonNotification);
    }

    public notifyWalletRefresh(newWallet: TorrenteWallet){
        const walletObject = new WalletRefreshNotification({wallet: newWallet});

        const jsonNotification = JSON.stringify(walletObject.getNotificationObject());           
        ConnectionController.getConnection().send(jsonNotification);
    }
}
