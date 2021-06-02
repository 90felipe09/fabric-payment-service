export enum MessagesTypesEnum {
    DownloadedBlock = "DownloadedBlock",
    Authenticated = "Authenticated"
}

export interface IMessagesModel<T> {
    type : MessagesTypesEnum;
    data: T;
}