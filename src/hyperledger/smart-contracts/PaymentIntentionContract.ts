import { Contract } from "fabric-network";
import { v4 as uuidv4 } from "uuid";
import { PaymentIntentionResponse } from "../../payment/models/PaymentServiceInterface";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { PAYMENT_INTENTION_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract";

export type PaymentAttributes = {
    id: string;
    torrent_attributes: TorrentAttributes
}

export type TorrentAttributes = {
    data_id: string;
    value_to_freeze: number;
    expiration_date: string;
    created_at: string;
}

export const EXPIRATION_DELTA_DAYS = 7;

export class PaymentIntentionContract extends SmartContract {
    chaincodeReference: Contract;
    public constructor(credentials: IAuthenticatedMessageData) {
        super(credentials, PAYMENT_INTENTION_CONTRACT);
    }

    public invokeCreatePaymentIntention = async (magneticLink: string, valueToFreeze: number): Promise<PaymentIntentionResponse> => {
        const creationDate = new Date();
        const expirationDate = new Date(creationDate)
        expirationDate.setDate(creationDate.getDate() + EXPIRATION_DELTA_DAYS);
        const paymentAttributes: PaymentAttributes = {
            id: uuidv4(),
            torrent_attributes: {
                data_id: magneticLink,
                value_to_freeze: valueToFreeze,
                created_at: creationDate.toDateString(),
                expiration_date: expirationDate.toDateString()
            }
        }
        const stringfiedObject: string = JSON.stringify(paymentAttributes.torrent_attributes)
        return this.invokeTransaction('createPaymentIntention', [paymentAttributes.id, stringfiedObject]);
    }
    
    public invokeReadPaymentIntention = async (downloadIntentionId: string): Promise<PaymentIntentionResponse> => {
        return this.evaluateTransaction('readPaymentIntention', [downloadIntentionId]);
    }

    public queryGetPiecePrice = async (): Promise<number> => {
        return this.evaluateTransaction('getBlockPrice', []);
    }
}