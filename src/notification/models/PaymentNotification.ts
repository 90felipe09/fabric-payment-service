import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IPaymentNotifyData {
    torrentId: string;
    UserIp: string;
}

export class PaymentNotification implements INotificationModel <IPaymentNotifyData>{
    data: IPaymentNotifyData;
    type: NotificationTypesEnum;

    constructor(data: IPaymentNotifyData){
        this.type = NotificationTypesEnum.PaymentNotification;
        this.data = data;
    }

    getPaymentData(): IPaymentNotifyData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<IPaymentNotifyData>{
        return {
            type: this.type,
            data: this.data
        };
    }

    setPaymentData(torrentId?: string,  UserIp?: string) { 
        torrentId && (this.data.torrentId = torrentId);
        UserIp && (this.data.UserIp = UserIp);
    }

}