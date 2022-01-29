import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IDownloadedBlockMessageData {
    fileSize: number;
    uploaderIp: string;
    magneticLink: string;
}

export class DownloadedBlockMessage implements IMessagesModel <IDownloadedBlockMessageData>{
    data: IDownloadedBlockMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IDownloadedBlockMessageData>){
        this.type = MessagesTypesEnum.DownloadedBlock;
        this.data = message.data;
    }

    getPaymentData(): IDownloadedBlockMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IDownloadedBlockMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}