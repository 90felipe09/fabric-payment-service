import { X509Provider } from "fabric-network/lib/impl/wallet/x509identity";
import { TorrentePaymentReceivedSocket } from "../connections/TorrentePaymentReceivedSocket";
import { PaymentController } from "./PaymentController";
import { ReceiverController } from "./ReceiverController";

export class SessionController {
    loadedUserIdentity: X509Provider;
    loadedUserKey: string;
    receivingListeners: ReceiverController[];
    payingControllers: PaymentController[];
    torrenteSocket: TorrentePaymentReceivedSocket;

    public constructor (userPrivateKey: string){
        this.loadedUserKey = userPrivateKey;
        this.loadedUserIdentity = new X509Provider();
        this.torrenteSocket = new TorrentePaymentReceivedSocket();
    }

    public payUploader(uploaderPublicKey: string, torrentId: string){
        const uploaderToPay = this.payingControllers.find(paymentController => {
            return paymentController.isSeekingInstance(uploaderPublicKey, torrentId);
        })

        uploaderToPay && uploaderToPay.payHash();
    }

    public addReceivingListener(ip: string, payerPublicKey: string){
        const newReceiverListener = new ReceiverController(
            ip, 
            payerPublicKey,
            this.torrenteSocket);
        this.receivingListeners.push(newReceiverListener);
    }

    public addPayingControllers(
        ip: string, 
        receiverPublicKey: string, 
        numberOfBlocks: number,
        torrentId: string
        ){
        const newPaymentController = new PaymentController(
            ip,
            receiverPublicKey, 
            numberOfBlocks, 
            this.loadedUserKey,
            torrentId)

        this.payingControllers.push();
    }
}