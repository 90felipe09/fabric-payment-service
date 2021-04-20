import { TorrentePaymentReceivedSocket } from "../connections/TorrentePaymentReceivedSocket";
import { PaymentStatusEnum } from "../models/PaymentNotificationModel";

export class ReceiverController {
    loadedPayerPublicKey: string;
    torrentId: string;
    torrenteSocket: TorrentePaymentReceivedSocket;

    public constructor(
        ip: string, 
        payerPublicKey: string, 
        torrenteSocket: TorrentePaymentReceivedSocket
        ){
        this.torrenteSocket = torrenteSocket;
        this.loadedPayerPublicKey = payerPublicKey;
    }

    private notifyValidPayment (ip: string) {
        this.torrenteSocket.sendMessage({
            ip: ip,
            torrentId: this.torrentId,
            status: PaymentStatusEnum.OK
        })
    }
}