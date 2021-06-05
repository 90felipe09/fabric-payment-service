import { ResponseModel } from "./ResponseModel";

export interface CommitResponseContent {
    result: string;
}

export const SuccesfulCommitResponse: ResponseModel<CommitResponseContent> = {
    status: 200,
    content: {
        result: "Commitment accepted."
    }
}

export const WrongCommitmentResponse: ResponseModel<CommitResponseContent> = {
    status: 400,
    content: {
        result: "Commitment refused. Try again."
    }
}