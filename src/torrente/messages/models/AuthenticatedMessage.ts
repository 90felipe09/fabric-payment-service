import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IAuthenticatedMessageData {
    certificate: string;
    privateKey: string;
    mspId: string;
}

export class AuthenticatedMessage implements IMessagesModel <IAuthenticatedMessageData>{
    data: IAuthenticatedMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IAuthenticatedMessageData>){
        this.type = MessagesTypesEnum.Authenticated;
        this.data = message.data;
    }

    getAuthenticationData(): IAuthenticatedMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IAuthenticatedMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}