export enum PayfluxoRequestsTypesEnum {
    MicroPaymentRequest = "MicropaymentRequest",
    CommitmentMessage = "CommitmentMessage",
    CertificateResponse = "CertificateResponse",
    CertificateRequest = "CertificateRequest",
    CommitmentAcceptance = "CommitmentAcceptance",
    CommitmentRejection = "CommitmentRejection",
    MicroPaymentReject = "MicroPaymentReject",
    MicroPaymentAccept = "MicroPaymentAccept"
}

export interface IPayfluxoRequestModel<T> {
    type : PayfluxoRequestsTypesEnum;
    data: T;
}
