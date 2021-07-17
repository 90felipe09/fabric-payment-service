import { IMessagesModel, MessagesTypesEnum } from "./MessageModel";

export interface IRedeemValuesMessageData {
    message: string;
}

export class RedeemValuesMessage implements IMessagesModel <IRedeemValuesMessageData>{
    data: IRedeemValuesMessageData;
    type: MessagesTypesEnum;

    constructor(message: IMessagesModel<IRedeemValuesMessageData>){
        this.type = MessagesTypesEnum.RedeemValues;
        this.data = message.data;
    }

    getRedeemData(): IRedeemValuesMessageData{
        return this.data;
    }

    getNotificationObject(): IMessagesModel<IRedeemValuesMessageData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}