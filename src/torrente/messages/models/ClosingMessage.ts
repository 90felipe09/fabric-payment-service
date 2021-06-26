import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IClosingMessageData {
    message: string;
}

export class ClosingMessage implements IMessagesModel <IClosingMessageData>{
    data: IClosingMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IClosingMessageData>){
        this.type = MessagesTypesEnum.Closing;
        this.data = message.data;
    }

    getAuthenticationData(): IClosingMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IClosingMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}