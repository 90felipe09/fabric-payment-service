import { Contract } from "fabric-network";
import { CommitmentContent, CommitmentMessage } from "../../payment/models/Commitment";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { REDEEM_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract"; 

type PaymentAttributes = {
    magnetic_link: string;
    value_to_freeze: number;
    expiration_date: string;
    created_at: string 
}

type PaymentIntentionResponse = {
    id: string,
    magnetic_link: string,
    payer_address: string,
    value_to_freeze: number,
    expiration_date: string,
    created_at: string
}

export const EXPIRATION_DELTA_DAYS = 7;

export class PaymentIntentionContract extends SmartContract {
    chaincodeReference: Contract;
    public constructor(credentials: IAuthenticatedMessageData) {
        super(credentials, REDEEM_CONTRACT);
    }

    public invokeCreatePaymentIntention = async (magneticLink: string, valueToFreeze: number): Promise<PaymentIntentionResponse> => {
        const creationDate = new Date();
        const expirationDate = new Date(creationDate.getDate() + EXPIRATION_DELTA_DAYS);
        const paymentAttributes: PaymentAttributes = {
            magnetic_link: magneticLink,
            value_to_freeze: valueToFreeze,
            created_at: creationDate.toDateString(),
            expiration_date: expirationDate.toDateString()
        }
        return this.invokeTransaction('createPaymentIntention', [paymentAttributes]);
    }
    
    public invokeReadPaymentIntention = async (downloadIntentionId: string): Promise<PaymentIntentionResponse> => {
        return this.invokeTransaction('readPaymentIntention', [downloadIntentionId]);
    }
}