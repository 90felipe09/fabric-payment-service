import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface ILogoutMessageData {
    message: string;
}

export class LogoutMessage implements IMessagesModel <ILogoutMessageData>{
    data: ILogoutMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<ILogoutMessageData>){
        this.type = MessagesTypesEnum.Logout;
        this.data = message.data;
    }

    getAuthenticationData(): ILogoutMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<ILogoutMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}