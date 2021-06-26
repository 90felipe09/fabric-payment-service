export enum MessagesTypesEnum {
    DownloadedBlock = "DownloadedBlock",
    Authenticated = "Authenticated",
    Closing = "Closing"
}

export interface IMessagesModel<T> {
    type : MessagesTypesEnum;
    data: T;
}