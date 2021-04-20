import express from 'express';
import http from 'http';
import WebSocket from "ws";
import { PaymentNotificationModel } from '../models/PaymentNotificationModel';

export class TorrentePaymentReceivedSocket {
    public static TORRENTE_PORT: number = 7700;
    public wsTorrente: WebSocket;
    
    public sendMessage (message: PaymentNotificationModel){
        this.wsTorrente.send(JSON.stringify(message))
    }

    public constructor (){
        const app = express();
    
        //initialize a simple http server
        const server = http.createServer(app);
        
        //initialize the WebSocket server instance
        const wss = new WebSocket.Server({ server });
        
        wss.on('connection', (ws: WebSocket) => {
            this.wsTorrente = ws;
        
            //connection is up, let's add a simple simple event
            ws.on('message', (message: string) => {
        
                //log the received message and send it back to the client
                console.log('received: %s', message);
            });
        
            //send immediatly a feedback to the incoming connection    
            ws.send("Connected to Torrente Payment Service");
            console.log("Connected to Torrente Client");
        });
        
        //start our server
        server.listen(TorrentePaymentReceivedSocket.TORRENTE_PORT, () => {
            console.log(`Waiting for Torrente connection on port: ${TorrentePaymentReceivedSocket.TORRENTE_PORT})`);
        });
    }
}