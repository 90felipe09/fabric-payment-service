export enum MessagesTypesEnum {
    DownloadedBlock = "DownloadedBlock",
    Authenticated = "Authenticated",
    Closing = "Closing",
    Logout = "Logout"
}

export interface IMessagesModel<T> {
    type : MessagesTypesEnum;
    data: T;
}