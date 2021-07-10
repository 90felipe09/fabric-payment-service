import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IDownloadIntentionMessageData {
    magneticLink: string;
    piecesNumber: number;
    torrentId: string;
}

export class DownloadIntentionMessage implements IMessagesModel <IDownloadIntentionMessageData>{
    data: IDownloadIntentionMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IDownloadIntentionMessageData>){
        this.type = MessagesTypesEnum.DownloadIntention;
        this.data = message.data;
    }

    getDownloadIntentionData(): IDownloadIntentionMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IDownloadIntentionMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}