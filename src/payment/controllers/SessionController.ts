import { PaymentController } from "./PaymentController";
import { ReceiverController } from "./ReceiverController";

export class SessionController {
    loadedUserKey: string;
    receivingListeners: ReceiverController[];
    payingControllers: PaymentController[];

    public constructor (userPrivateKey: string){
        this.loadedUserKey = userPrivateKey;
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
            payerPublicKey);
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

        this.payingControllers.push(newPaymentController);
    }
}