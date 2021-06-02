import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { TORRENTE_NOTIFICATION_PORT } from '../config';
import { MessagesHandler } from './messages/MessagesHandler';
import { NotificationHandler } from './notification/NotificationHandler';

export class ConnectionController {
    torrenteConnection: WebSocket;
    notificationHandler: NotificationHandler;
    messagesHandler: MessagesHandler;

    public getConnection(){
        console.log(this.torrenteConnection);
        return this.torrenteConnection;
    }

    openConnection(){ 
        const app = express();
        const server = http.createServer(app);
        const wss = new WebSocket.Server({ clientTracking: true, server});
        
        return new Promise((resolve, reject) => {
            try{
                server.listen(TORRENTE_NOTIFICATION_PORT, () => {
                    console.log(`Notification port open on: ${TORRENTE_NOTIFICATION_PORT}`);
                });
                wss.on('connection', (ws: WebSocket) => {
                    this.handleConnection(ws);

                    ws.on("close", this.handleDisconnection);

                    ws.on("message", this.messagesHandler.handleMessage)
                });

                resolve("success");
               
            }
            catch(e) {
                console.log('Error:', e);
                reject("failed")
            }
        });
    }

    handleConnection(ws: WebSocket) {
        this.torrenteConnection = ws;
        this.notificationHandler = new NotificationHandler(ws);
        this.messagesHandler = new MessagesHandler(ws, this.notificationHandler);
        console.log("connected to Torrente");
        this.notificationHandler.notifyConnection();
    }

    handleDisconnection() {
        console.log("disconnected from Torrente");
    }

}

