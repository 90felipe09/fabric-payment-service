import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { PAYFLUXO_LISTENING_PORT } from '../../config';
import { ConnectionsMap } from '../controllers/ConnectionsMap';
import { tryNatTraversal } from '../util/NatTraversalHandler';
import { getConnectionHash } from '../util/peerHash';
import { ConnectionResource } from '../controllers/ConnectionResource';


export class PayfluxoServer {
    private static instance: PayfluxoServer;
    private static wss: WebSocket.Server;
    private static connectionsMap: ConnectionsMap;
    
    public getConnectionsMap = (): ConnectionsMap => {
        return PayfluxoServer.connectionsMap;
    }

    public static getInstance = (): PayfluxoServer => {
        if (!PayfluxoServer.instance){
            throw Error("PayfluxoServer not initialized yet");
        }
        return PayfluxoServer.instance;
    }

    constructor() {
        const app = express();
        const server = http.createServer(app);
        PayfluxoServer.connectionsMap = new ConnectionsMap();
        PayfluxoServer.wss = new WebSocket.Server({ clientTracking: true, server });

        server.listen(PAYFLUXO_LISTENING_PORT, () => {
            console.log(`[INFO] Payfluxo started on port: ${PAYFLUXO_LISTENING_PORT}`);
        })

        tryNatTraversal().catch((err) => {
            console.log("[ERROR]: ", err.message);
            /// must notify that didn't work
        });

        PayfluxoServer.wss.on('connection', (ws: WebSocket, httpRequest: http.IncomingMessage) => {
            const requesterIp = httpRequest.socket.localAddress;
            const requesterPort = httpRequest.socket.localPort;
            console.log(`[INFO] Connected to incoming connection from ${requesterIp}:${requesterPort}`);
            const connectionHash = getConnectionHash(requesterIp, requesterPort)
            PayfluxoServer.connectionsMap.addConnection(connectionHash, ws, requesterIp, requesterPort)
            const connectionResources = PayfluxoServer.connectionsMap.getConnection(connectionHash)
            ws.on("close", (_ws: WebSocket, _code: number, _reason: string) => PayfluxoServer.handleCloseConnection(connectionResources))
        })

        app.get('/', (_req, res) => {res.send("I'm listening");})

        PayfluxoServer.instance = this;
    }

    public static closeServer = () => {
        PayfluxoServer.wss.close();
        Object.values(PayfluxoServer.connectionsMap.getConnections()).forEach(conn => {
            conn.ws.close()
        })
        delete PayfluxoServer.instance;
    }

    private static handleCloseConnection = (connectionResources: ConnectionResource) => {
        console.log(`[INFO] Closed connection with ${connectionResources.ip}:${connectionResources.port}`);
        PayfluxoServer.connectionsMap.removeConnection(connectionResources.peerHash);
    }
}
