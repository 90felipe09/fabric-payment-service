import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IIntentionDeclaredNotifyData {
    torrentId: string;
    status: number;
}

export class IntentionDeclaredNotification implements INotificationModel <IIntentionDeclaredNotifyData>{
    data: IIntentionDeclaredNotifyData;
    type: NotificationTypesEnum;

    constructor(data: IIntentionDeclaredNotifyData){
        this.type = NotificationTypesEnum.IntentionDeclaredNotification;
        this.data = data;
    }

    getDeclarationData(): IIntentionDeclaredNotifyData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<IIntentionDeclaredNotifyData>{
        return {
            type: this.type,
            data: this.data
        };
    }

}