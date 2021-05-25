import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { tryNatTraversal } from './payment/connections/NatTraversalHandler';
import { ConnectionController } from './torrente/ConnectionController';

const app = express();
const server = http.createServer(app);
var con = new ConnectionController;

con.openConnection().then( (connection:WebSocket) => {
  console.log("resolved");
}).catch( (error) => {
    console.log("Rejected:", error)
});

server.listen( 7777, () => {
  console.log("Server started on port: 7777")
}) 

app.get('/test', (req, res) => {
  con.notificationHandler.notifyPayment("182.16.15.12", "test")
})