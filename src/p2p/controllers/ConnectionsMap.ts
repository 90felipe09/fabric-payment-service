import WebSocket from 'ws';
import { ConnectionResource } from './ConnectionResource';


type ConnectionsMapObject = {
    [peerHash: string]: ConnectionResource
}

export class ConnectionsMap{
    connections: ConnectionsMapObject;

    public constructor() {
        this.connections = {};
    }

    public addConnection = (peerHash: string, connection: WebSocket, ip: string, port: number) => {
        if (Object.keys(this.connections).includes(peerHash)){
            throw Error("Already connected with this peer.");
        }
        const newConnection = new ConnectionResource(connection, ip, port);
        this.connections[peerHash] = newConnection;
    }

    public isConnected = (peerHash: string): boolean => {
        return Object.keys(this.connections).includes(peerHash);
    }

    public getConnections = (): ConnectionsMapObject => {
        return this.connections;
    }

    public getConnection = (peerHash: string): ConnectionResource => {
        return this.connections[peerHash];
    }

    public removeConnection = (peerHash: string) => {
        delete this.connections[peerHash]
    }
}
