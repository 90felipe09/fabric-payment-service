import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { PAYFLUXO_LISTENING_PORT } from '../../config';
import { ConnectionsMap } from '../controllers/ConnectionsMap';
import { tryNatTraversal } from '../util/NatTraversalHandler';
import { getConnectionHash } from '../util/peerHash';
import { ConnectionResource } from '../controllers/ConnectionResource';
import { ConnectionController } from '../../torrente/ConnectionController';
import { NotificationHandler } from '../../torrente/notification/NotificationHandler';
import { PayfluxoConsole } from '../../console/Console';


export class PayfluxoServer {
    private static instance: PayfluxoServer;
    private static wss: WebSocket.Server;
    private static connectionsMap: ConnectionsMap;

    private static server: http.Server
    private static app;

    private static endResolver: (value?: unknown) => void = () => {};
    
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
        PayfluxoServer.app = express();
        PayfluxoServer.server = http.createServer(PayfluxoServer.app);
        PayfluxoServer.connectionsMap = new ConnectionsMap();
        const serverParams: WebSocket.ServerOptions = {
            clientTracking: true,
            server: PayfluxoServer.server
        }
        PayfluxoServer.wss = new WebSocket.Server(serverParams);

        const console = PayfluxoConsole.getInstance();

        PayfluxoServer.server.listen(PAYFLUXO_LISTENING_PORT, () => {
            console.debug(`Payfluxo started on port: ${PAYFLUXO_LISTENING_PORT}`);
        })

        tryNatTraversal().catch(async(err) => {
            await ConnectionController.waitUntillConnection();
            NotificationHandler.getInstance().notifyNATIssue();
            console.warn(`${err.message}`);
        });

        PayfluxoServer.wss.on('connection', (ws: WebSocket, httpRequest: http.IncomingMessage) => {
            const requesterIp = httpRequest.socket.localAddress;
            const requesterPort = httpRequest.socket.localPort;
            console.debug(`Connected to incoming connection from ${requesterIp}:${requesterPort}`);
            const connectionHash = getConnectionHash(requesterIp, requesterPort)
            PayfluxoServer.connectionsMap.addConnection(connectionHash, ws, requesterIp, requesterPort)
            const connectionResources = PayfluxoServer.connectionsMap.getConnection(connectionHash)
            ws.on("close", (_ws: WebSocket, _code: number, _reason: string) => PayfluxoServer.handleCloseConnection(connectionResources))
        })

        PayfluxoServer.app.get('/', (_req, res) => {res.send("I'm listening");})

        PayfluxoServer.instance = this;
    }

    public static waitTillClosed = async(): Promise<void> => {
        if (!PayfluxoServer.instance){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        else{
            const endPromise = new Promise((resolve: (value: void) => void, _reject) => {
                PayfluxoServer.endResolver = resolve;
            })
            return endPromise;
        }
    }

    public static closeServer = () => {
        Object.values(PayfluxoServer.connectionsMap.getConnections()).forEach(conn => {
            conn.ws.close()
        })
        PayfluxoServer.wss.close();
        PayfluxoServer.server.close();
        PayfluxoServer.endResolver();
    }

    private static handleCloseConnection = (connectionResources: ConnectionResource) => {
        const console = PayfluxoConsole.getInstance();
        console.debug(`Closed connection with ${connectionResources.ip}:${connectionResources.port}`);
        PayfluxoServer.connectionsMap.removeConnection(connectionResources.peerHash);
    }
}
