export enum NotificationTypesEnum {
    PaymentNotification = "PaymentNotification",
    ConnectionNotification = "ConnectionNotification",
    NATNotifcation = "NATNotifcation",
    IntentionDeclaredNotification = "IntentionDeclaredNotification"
}

export interface INotificationModel<T> {
    type : NotificationTypesEnum;
    data: T;
}