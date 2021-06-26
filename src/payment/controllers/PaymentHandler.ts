import { Commitment, CommitmentMessage } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

export class PaymentHandler {
    commitment: Commitment;
    hashChain: HashChain;
    receiverIp: string;

    public initPaymentHandler = (
        ip: string,
        receiverCertificate: string,
        paymentSize: number,
        userPrivateKey: string,
        magneticLink: string,
        userCertificate: string) => {
        const hashChainSize = paymentSize / (1024 * 16)
        this.hashChain = new HashChain();
        this.hashChain.initHashChain(hashChainSize);
        this.commitment = new Commitment();
        this.receiverIp = ip;
        this.commitment.initCommitment(
            magneticLink, 
            receiverCertificate, 
            this.hashChain.getHashRoot(), 
            userPrivateKey,
            userCertificate)
    }

    public loadPaymentHandler = (ip: string, commitment: CommitmentMessage, hashChain: string[], lastHashSent: string, lastHashIndex: number) => {
        this.receiverIp = ip;
        this.commitment = new Commitment();
        this.commitment.loadCommitment(commitment);
        this.hashChain = new HashChain();
        this.hashChain.setHashChain(hashChain, lastHashSent, lastHashIndex);
    }

    public retryLastPayment = (): [string, number] => {
        const hashLinkIndex = this.hashChain.payHashIndex() - 1;
        const hashLink = this.hashChain.hashes[this.hashChain.hashToPay + 1];
        return [hashLink, hashLinkIndex];
    }

    public payHash = (): [string, number] => {
        const hashLinkIndex = this.hashChain.payHashIndex();
        const hashLink = this.hashChain.payHash()
        return [hashLink, hashLinkIndex];
    }

}