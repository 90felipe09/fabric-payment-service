export enum NotificationTypesEnum {
    PaymentNotification = "PaymentNotification",
    ConnectionNotification = "ConnectionNotification",
    NATNotifcation = "NATNotifcation",
    IntentionDeclaredNotification = "IntentionDeclaredNotification",
    WalletNotification = "WalletNotification"
}

export interface INotificationModel<T> {
    type : NotificationTypesEnum;
    data: T;
}