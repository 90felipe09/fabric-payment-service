import { IPaymentNotifyData } from "../../torrente/notification/models/PaymentNotification";
import { ResponseModel } from "./ResponseModel";

export interface PaymentResponseContent {
    result: string;
}

export interface PaymentHandleReturn<T> {
    payerResponse: ResponseModel<T>;
    torrenteNotification: IPaymentNotifyData;
}

export const SuccesfulPaymentResponse: ResponseModel<PaymentResponseContent> = {
    status: 200,
    content: {
        result: "Payment accepted."
    }
}

export const WrongPaymentResponse: ResponseModel<PaymentResponseContent> = {
    status: 400,
    content: {
        result: "Payment refused. Try again."
    }
}

export const CommitmentNotFoundResponse: ResponseModel<PaymentResponseContent> = {
    status: 404,
    content: {
        result: "Commitment not found refused. Please, commit before paying."
    }
}
