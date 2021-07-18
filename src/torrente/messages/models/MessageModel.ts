export enum MessagesTypesEnum {
    DownloadedBlock = "DownloadedBlock",
    Authenticated = "Authenticated",
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