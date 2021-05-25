import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface INATNotifyData {
    message: string;
}

export class NATNotification implements INotificationModel <INATNotifyData>{
    data: INATNotifyData;
    type: NotificationTypesEnum;

    constructor(data: INATNotifyData){
        this.type = NotificationTypesEnum.NATNotifcation;
        this.data = data;
    }

    getPaymentData(): INATNotifyData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<INATNotifyData>{
        return {
            type: this.type,
            data: this.data
        };
    }

    setPaymentData(message: string) { 
        this.data.message = message;
    }

}