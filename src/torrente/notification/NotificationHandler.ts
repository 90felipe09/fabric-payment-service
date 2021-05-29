import WebSocket from "ws";
import { PAYFLUXO_LISTENING_PORT, PAYFLUXO_EXTERNAL_PORT } from "../../config";
import { ConnectionNotification } from "./models/ConnectionNotification";
import { NATNotification } from "./models/NATNotification";
import { PaymentNotification } from "./models/PaymentNotification";

export class NotificationHandler {
    torrenteConnection: WebSocket

    constructor(ws: WebSocket){
        this.torrenteConnection = ws;
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

    notifyPayment(ip: string, torrentId: string){
        const notificationObject = new PaymentNotification({
            UserIp: ip,
            torrentId: torrentId
        });

        const jsonNotification = JSON.stringify(notificationObject.getNotificationObject());           
        this.torrenteConnection.send(jsonNotification);
    }
}