import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { NotificationController } from './notification/NotificationController';
import { tryNatTraversal } from './payment/connections/NatTraversalHandler';
import { startPayfluxoServer } from './payment/connections/PayfluxoServer';

const app = express();
const server = http.createServer(app);
var con = new NotificationController;

con.openConnection().then( (connection:WebSocket) => {
  console.log("resolved");
  try { tryNatTraversal(); } 
  catch(e){ con.notifyNATIssue(); }
  startPayfluxoServer();
}).catch( (error) => {
    console.log("Rejected:", error)
});


server.listen( 7777, () => {
  console.log("Server started on port: 7777")
}) 

app.get('/test', (req, res) => {
  con.notifyPayment("182.16.15.12", "test")
})