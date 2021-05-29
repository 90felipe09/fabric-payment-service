import { PaymentStatusEnum } from "../models/PaymentNotificationModel";

export class ReceiverHandler {
    loadedPayerPublicKey: string;
    torrentId: string;

    public constructor(
        ip: string, 
        payerPublicKey: string
        ){
        this.loadedPayerPublicKey = payerPublicKey;
    }

    private verifyPayment (ip: string) {
        // TODO
    }
}