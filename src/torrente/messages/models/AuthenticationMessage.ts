import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IAuthenticationMessageData {
    encrypted_content: string;
    salt: string;
    password: string;
}

export class AuthenticationMessage implements IMessagesModel <IAuthenticationMessageData>{
    data: IAuthenticationMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IAuthenticationMessageData>){
        this.type = MessagesTypesEnum.Authentication;
        this.data = message.data;
    }

    getAuthenticationData(): IAuthenticationMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IAuthenticationMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }
}
