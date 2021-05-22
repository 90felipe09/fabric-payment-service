import http from 'http';
import express from 'express';
import WebSocket, { Server } from 'ws';
import {sessionController} from './notification/sessionController'


const app = express();
const server = http.createServer(app);
var con = new sessionController;

con.openConnection().then( (connection:WebSocket) => {
    console.log("resolved");
    
}).catch( (error) => {
    console.log("Rejected:", error)
});


server.listen( 7777, () => {
  console.log("Server started on port: 7777")
}) 

app.get('/test', (req, res) => {
  con.sendNotification("182.16.15.12", "test")
})