import { Commitment } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

export class PaymentHandler {
    commitment: Commitment;
    hashChain: HashChain;

    public constructor (
        ip: string,
        receiverCertificate: string,
        paymentSize: number,
        userPrivateKey: string,
        magneticLink: string,
        userCertificate: string
        ) {
        const hashChainSize = paymentSize / (1024 * 16)
        this.hashChain = new HashChain(hashChainSize);
        this.commitment = new Commitment(
            magneticLink, 
            receiverCertificate, 
            this.hashChain.getHashRoot(), 
            userPrivateKey,
            userCertificate)
    }

    public retryLastPayment = (): [string, number] => {
        const hashLinkIndex = this.hashChain.hashes.length - this.hashChain.hashToPay - 1;
        const hashLink = this.hashChain.hashes[this.hashChain.hashToPay + 1];
        return [hashLink, hashLinkIndex];
    }

    public payHash = (): [string, number] => {
        const hashLinkIndex = this.hashChain.hashToPay;
        const hashLink = this.hashChain.payHash()
        return [hashLink, hashLinkIndex];
    }

}