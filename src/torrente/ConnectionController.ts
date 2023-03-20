import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { TORRENTE_NOTIFICATION_PORT } from '../config';
import { PayfluxoConsole } from '../console/Console';
import { MessagesHandler } from './messages/MessagesHandler';
import { MessagesHandlersMap } from './messages/models/MessagesHandlersMap';
import { NotificationHandler } from './notification/NotificationHandler';

export class ConnectionController {
    private static torrenteConnection: WebSocket;
    private static connectionResolver: (value?: unknown) => void = () => {};

    public static getConnection = (): WebSocket => {
        if (!ConnectionController.torrenteConnection){
            throw Error("Connection with torrent not initialized yet")
        }
        return ConnectionController.torrenteConnection;
    }

    openConnection(messagesHandler: MessagesHandlersMap){ 
        const app = express();
        const server = http.createServer(app);
        const wss = new WebSocket.Server({ clientTracking: true, server});
        const console = PayfluxoConsole.getInstance();
        
        return new Promise((resolve, reject) => {
            try{
                server.listen(TORRENTE_NOTIFICATION_PORT, () => {
                    console.debug(`Notification port open on: ${TORRENTE_NOTIFICATION_PORT}`);
                });
                wss.on('connection', (ws: WebSocket) => {
                    this.handleConnection(ws, messagesHandler);

                    ws.on("close", this.handleDisconnection);

                    ws.on("message", MessagesHandler.getInstance().handleMessage)
                });

                resolve("success");
               
            }
            catch(e) {
                console.error(`${e}`);
                reject("failed")
            }
        });
    }

    handleConnection(ws: WebSocket, messagesHandler: MessagesHandlersMap) {
        ConnectionController.torrenteConnection = ws;
        new NotificationHandler();
        new MessagesHandler(messagesHandler);
        const console = PayfluxoConsole.getInstance();
        console.sucess("Connected to Torrente");
        NotificationHandler.getInstance().notifyConnection();
        ConnectionController.connectionResolver();
    }

    public static waitUntillConnection = async (): Promise<void> => {
        if(!ConnectionController.torrenteConnection){
            return new Promise((resolve, _reject) => {
                ConnectionController.connectionResolver = resolve;
            })
        }
        else if (ConnectionController.torrenteConnection.readyState === WebSocket.OPEN){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        return new Promise((resolve, _reject) => {
            ConnectionController.torrenteConnection.on("open", () => {
                resolve(null);
            })
        })
    }

    handleDisconnection() {
        const console = PayfluxoConsole.getInstance();
        console.warn("disconnected from Torrente");
    }

    public static waitUntillDisconnection = async (): Promise<void> => {
        if (ConnectionController.torrenteConnection.readyState === WebSocket.CLOSED){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        return new Promise((resolve, _reject) => {
            ConnectionController.torrenteConnection.on("close", () => {
                resolve(null);
            })
        })
    }

}

