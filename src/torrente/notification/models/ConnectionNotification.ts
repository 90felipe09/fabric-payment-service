import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IConnectionNotifyData {
    status: string;
}

export class ConnectionNotification implements INotificationModel <IConnectionNotifyData>{
    data: IConnectionNotifyData;
    type: NotificationTypesEnum;

    constructor(data: IConnectionNotifyData){
        this.type = NotificationTypesEnum.ConnectionNotification;
        this.data = data;
    }

    getPaymentData(): IConnectionNotifyData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<IConnectionNotifyData>{
        return {
            type: this.type,
            data: this.data
        };
    }

    setPaymentData(status: string) { 
        this.data.status = status;
    }

}