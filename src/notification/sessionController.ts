import WebSocket from 'ws';
import express from 'express';
import http from 'http';

export class sessionController {

    // private ws; 
    connections = {};
    private client ;
    
    torrenteConnection : WebSocket;

    public getConnections(){
        console.log(this.connections);
        return this.connections;
    }

    openConnection(){ 
        const app = express();
        const server = http.createServer(app);
        const wss = new WebSocket.Server({"clientTracking":true,server});
        
        return new Promise((resolve, reject) => {
            try{
                wss.on('connection', (ws: WebSocket) => {
                    this.torrenteConnection = ws;

                    //connection is up, let's add a simple simple event
                    ws.on('message', (message: string) => {

                        const data = JSON.parse(message);

                        //log the received message
                        console.log('received: %s', message);
                    });

                    const object = { 
                        type: "connectionNotification", 
                        data:{ 
                                status:"connected"
                        }
                     }
                    const json = JSON.stringify(object)      

                    //send immediatly a feedback to the incoming connection
                    ws.send(json);
                });

                server.listen( 7933, () => {
                    console.log("Server started on port: (${process.env.PORT || 8080})");
                });
                resolve("success");
               
            }
            catch(e) {
                console.log('Error:', e);
                reject("failed")
            }
        });
    }

    sendNotification(ip: string, torrentId: string){
        const object = { 
                        type: "PaymentNotification", 
                        data:{ 
                                ip: ip, 
                                torrentId: torrentId
                        }
                     }

        const json = JSON.stringify(object)             
        this.torrenteConnection.send(json)
    }

}

