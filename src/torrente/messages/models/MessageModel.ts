export enum MessagesTypesEnum {
    DownloadedBlock = "DownloadedBlock",
    Authentication = "Authentication",
    Closing = "Closing",
    Logout = "Logout",
    DownloadIntention = "DownloadIntention",
    RedeemValues = "RedeemValues",
    RefreshWallet = "RefreshWallet"
}

export interface IMessagesModel<T> {
    type : MessagesTypesEnum;
    data: T;
}