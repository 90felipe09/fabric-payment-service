import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IAuthenticationFailedNotifyData {
}

export class AuthenticationFailedNotification implements INotificationModel <IAuthenticationFailedNotifyData>{
    data: IAuthenticationFailedNotifyData;
    type: NotificationTypesEnum;

    constructor(){
        this.type = NotificationTypesEnum.AuthenticationFailedNotification;
        this.data = {};
    }

    getPaymentData(): IAuthenticationFailedNotifyData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<IAuthenticationFailedNotifyData>{
        return {
            type: this.type,
            data: this.data
        };
    }
}