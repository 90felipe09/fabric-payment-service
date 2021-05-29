import WebSocket from "ws";
import { DownloadedBlockMessage } from "./models/DownloadedBlockMessage";
import { IMessagesModel, MessagesTypesEnum } from "./models/MessageModel";

export class MessagesHandler{
    torrenteConnection: WebSocket

    constructor(ws: WebSocket){
        this.torrenteConnection = ws;
    }

    handleDownloadedBlock(data: IMessagesModel<DownloadedBlockMessage>){
        // invoke methods from hyperledger module. requires talk with toshi
    }

    handleMessage(message: string){
        const messageObject = JSON.parse(message);
        switch (messageObject['type']) {
            case MessagesTypesEnum.DownloadedBlock:
                this.handleDownloadedBlock(messageObject['data']);
                break;
            default:
                break;
        }
    }
}