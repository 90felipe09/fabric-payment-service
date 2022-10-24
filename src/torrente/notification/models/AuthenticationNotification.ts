import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IAuthenticationNotifyData {
    certificate: string;
    orgMSPID: string;
}

export class AuthenticationNotification implements INotificationModel <IAuthenticationNotifyData>{
    data: IAuthenticationNotifyData;
    type: NotificationTypesEnum;

    constructor(data: IAuthenticationNotifyData){
        this.type = NotificationTypesEnum.AuthenticationNotification;
        this.data = data;
    }

    getPaymentData(): IAuthenticationNotifyData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<IAuthenticationNotifyData>{
        return {
            type: this.type,
            data: this.data
        };
    }
}