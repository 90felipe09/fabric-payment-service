import { Commitment } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

export class PaymentHandler {
    commitment: Commitment;
    hashChain: HashChain;

    public constructor (
        ip: string,
        receiverPublicKey: string,
        paymentSize: number,
        userPrivateKey: string,
        torrentId: string
        ) {
        this.hashChain = new HashChain(paymentSize);
        this.commitment = new Commitment(
            torrentId, 
            receiverPublicKey, 
            this.hashChain.getHashRoot(), 
            userPrivateKey)
    }

    public payHash() {
        return this.hashChain.payHash();
    }

    public isSeekingInstance(receiverPublicKey: string, torrentId: string){
        return (
            this.commitment.getReceiver() === receiverPublicKey && 
            this.commitment.getTorrent() === torrentId);
    }

}