export enum PaymentStatusEnum {
    OK = "OK",
    Invalid = "Invalid",
    Pendent = "Pendent"
}

export type PaymentNotificationModel = {
    ip: string,
    torrentId: string,
    status: PaymentStatusEnum
}