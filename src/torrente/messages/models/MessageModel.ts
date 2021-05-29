export enum MessagesTypesEnum {
    DownloadedBlock = "DownloadedBlock",
}

export interface IMessagesModel<T> {
    type : MessagesTypesEnum;
    data: T;
}