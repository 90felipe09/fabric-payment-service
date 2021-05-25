export enum NotificationTypesEnum {
    PaymentNotification = "PaymentNotification",
    ConnectionNotification = "ConnectionNotification",
    NATNotifcation = "NATNotifcation"
}

export interface INotificationModel<T> {
    type : NotificationTypesEnum;
    data: T;
}