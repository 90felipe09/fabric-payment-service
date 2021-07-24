import WebSocket from "ws";
import { PAYFLUXO_LISTENING_PORT, PAYFLUXO_EXTERNAL_PORT } from "../../config";
import { TorrenteWallet } from "../../payment/models/TorrenteWallet";
import { ConnectionNotification } from "./models/ConnectionNotification";
import { IntentionDeclaredNotification } from "./models/IntentionDeclaredNotification";
import { NATNotification } from "./models/NATNotification";
import { PaymentNotification } from "./models/PaymentNotification";
import { WalletRefreshNotification } from "./models/WalletNotification";

export enum DownloadDeclarationIntentionStatusEnum {
    SUCCESS = 0,
    NO_FUNDS = 1
}

export class NotificationHandler {
    torrenteConnection: WebSocket

    constructor(ws: WebSocket){
        this.torrenteConnection = ws;
    }

    notifyDownloadDeclarationIntentionStatus(torrentId: string, status: DownloadDeclarationIntentionStatusEnum) {
        const notificationObject = new IntentionDeclaredNotification({
            status: status,
            torrentId: torrentId
        })

        console.log({notificationObject});
        
        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());
        this.torrenteConnection.send(jsonNotification);
    }

    notifyNATIssue() {
        const notificationObject = new NATNotification({
            message: `Couldn't open port on NAT. Please, map internal port ${PAYFLUXO_LISTENING_PORT} to external port ${PAYFLUXO_EXTERNAL_PORT}`
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());        
        this.torrenteConnection.send(jsonNotification);
    }

    notifyConnection() {
        const notificationObject = new ConnectionNotification({
            status: "connected"
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());          
        this.torrenteConnection.send(jsonNotification);
    }

    notifyPayment(ip: string, magneticLink: string){
        const notificationObject = new PaymentNotification({
            payerIp: ip,
            magneticLink: magneticLink
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());           
        this.torrenteConnection.send(jsonNotification);
    }

    notifyWalletRefresh(newWallet: TorrenteWallet){
        const walletObject = new WalletRefreshNotification({wallet: newWallet});

        const jsonNotification = JSON.stringify(walletObject.getNotificationObject());           
        this.torrenteConnection.send(jsonNotification);
    }
}