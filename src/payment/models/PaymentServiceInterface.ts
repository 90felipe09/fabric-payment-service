import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { CommitmentMessage } from "./Commitment";

export type RedeemArguments = {
    commitment: CommitmentMessage;
    hashLink: string;
    hashLinkIndex: number;
}

export type AccountType = {
    id: string;
    address: string;
    name: string;
    tokens: string[];
    balance: string;
    public_key: string;
    created_at: string;
}

export type PaymentIntentionResponse = {
    id: string;
    magnetic_link: string;
    payer_address: string;
    value_to_freeze: number;
    available_funds: number;
    expiration_date: string;
    created_at: string;
}

export type CreatePaymentIntentionArguments = {
    magneticLink: string;
    valueToFreeze: number;
}

export interface PaymentServiceInterface {
    invokeRedeem: (redeemArguments: RedeemArguments) => Promise<void>;
    evaluateAccount: (accountId: string) => Promise<AccountType>;
    invokeCreatePaymentIntention: (createPaymentIntention: CreatePaymentIntentionArguments) => Promise<PaymentIntentionResponse>;
    invokeReadPaymentIntention: (downloadIntentionId: string) => Promise<PaymentIntentionResponse>;
    queryGetPiecePrice: () => Promise<number>;
    init: (authData: IAuthenticatedMessageData) => Promise<void>;
}
