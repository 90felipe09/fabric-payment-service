import { PaymentHandler } from "./PaymentHandler";
import { ReceiverHandler } from "./ReceiverHandler";

export class SessionController {
    loadedUserKey: string;
    receivingListeners: ReceiverHandler[];
    payingControllers: PaymentHandler[];

    public constructor (userPrivateKey: string){
        this.loadedUserKey = userPrivateKey;
    }

    public handleReceive(){
        // TODO
        return;
    }

    public handleCommit(){
        // TODO
        return;
    }

    public payUploader(uploaderPublicKey: string, torrentId: string){
        const uploaderToPay = this.payingControllers.find(paymentController => {
            return paymentController.isSeekingInstance(uploaderPublicKey, torrentId);
        })

        uploaderToPay && uploaderToPay.payHash();
    }

    public addReceivingListener(ip: string, payerPublicKey: string){
        const newReceiverListener = new ReceiverHandler(
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
        const newPaymentController = new PaymentHandler(
            ip,
            receiverPublicKey, 
            numberOfBlocks, 
            this.loadedUserKey,
            torrentId)

        this.payingControllers.push(newPaymentController);
    }
}