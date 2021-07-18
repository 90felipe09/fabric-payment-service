import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IRefreshWalletMessageData {
    message: string;
}

export class RefreshWalletMessage implements IMessagesModel <IRefreshWalletMessageData>{
    data: IRefreshWalletMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IRefreshWalletMessageData>){
        this.type = MessagesTypesEnum.RefreshWallet;
        this.data = message.data;
    }

    getRefreshWalletData(): IRefreshWalletMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IRefreshWalletMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}