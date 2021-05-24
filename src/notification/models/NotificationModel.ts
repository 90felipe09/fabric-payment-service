export enum NotificationTypesEnum {
    PaymentNotification = "PaymentNotification",
    ConnectionNotification = "ConnectionNotification"
}

export interface INotificationModel<T> {
    type : NotificationTypesEnum;
    data: T;
}