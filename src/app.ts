import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { PayfluxoConsole } from './console/Console';
import { payfluxoMessagesHandler } from './payment/handlers/TorrenteMessagesHandler';
import { ConnectionController } from './torrente/ConnectionController';

const app = express();
const server = http.createServer(app);
var con = new ConnectionController;
const console = PayfluxoConsole.getInstance();

console.startConsole();

con.openConnection(payfluxoMessagesHandler).then( (_connection:WebSocket) => {
  console.sucess("Payfluxo initiated. Waiting for Torrente Connection.");
}).catch( (error) => {
  console.error(`Torrente instance rejected connections ${error}`)
});

server.listen( 7777, () => {
}) 
