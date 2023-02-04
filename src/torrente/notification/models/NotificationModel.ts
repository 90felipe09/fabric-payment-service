export enum NotificationTypesEnum {
    PaymentNotification = "PaymentNotification",
    ConnectionNotification = "ConnectionNotification",
    NATNotification = "NATNotification",
    IntentionDeclaredNotification = "IntentionDeclaredNotification",
    WalletNotification = "WalletNotification",
    AuthenticationNotification = "AuthenticationNotification",
    AuthenticationFailedNotification = "AuthenticationFailedNotification"
}

export interface INotificationModel<T> {
    type : NotificationTypesEnum;
    data: T;
}