import { IPayfluxoRequestModel, PayfluxoRequestsTypesEnum } from "./PayfluxoRequestModel";

export interface CommitResponseContent {
    result: CommitmentResponseStatusEnum;
}

export enum CommitmentResponseStatusEnum{
    Accepted = "Accepted",
    Denied = "Denied"
}

export const SuccesfulCommitResponse: IPayfluxoRequestModel<CommitResponseContent> = {
    data: {
        result: CommitmentResponseStatusEnum.Accepted
    },
    type: PayfluxoRequestsTypesEnum.CommitmentAcceptance
}

export const WrongCommitmentResponse: IPayfluxoRequestModel<CommitResponseContent> = {
    data: {
        result: CommitmentResponseStatusEnum.Denied
    },
    type: PayfluxoRequestsTypesEnum.CommitmentAcceptance
}
