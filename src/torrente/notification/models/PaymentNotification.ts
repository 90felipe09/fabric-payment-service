import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IPaymentNotifyData {
    magneticLink: string;
    payerIp: string;
    blocksPaid: number;
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

    setPaymentData(magneticLink?: string,  payerIp?: string) { 
        magneticLink && (this.data.magneticLink = magneticLink);
        payerIp && (this.data.payerIp = payerIp);
    }

}