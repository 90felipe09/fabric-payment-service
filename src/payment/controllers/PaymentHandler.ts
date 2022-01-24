import { CommitmentMessage } from "../../p2p/models/CommitmentMessage";
import { Commitment } from "../models/Commitment";
import { HashChain } from "../models/HashChain";
import { MicroPaymentProtocol } from "../rules/MicroPaymentProtocol";
import { SessionController } from "./SessionController";

export class PaymentHandler  {
    commitment: Commitment;
    hashChain: HashChain;
    receiverIp: string;
    magneticLink: string;
    receiverCertificate: string;
    userCertificate: string;
    downloadIntentionId: string;
    validated: boolean;
    paymentProtocol: MicroPaymentProtocol

    public activatePaymentProtocol = (paymentProtocol: MicroPaymentProtocol) => {
        this.paymentProtocol = paymentProtocol;
    }

    public validatePaymentHandler = (receiverCertificate: string) => {
        this.receiverCertificate = receiverCertificate;
        const sessionController = SessionController.getInstance();
        this.commitment.initCommitment(
            this.magneticLink, 
            this.receiverCertificate, 
            this.hashChain.getHashRoot(), 
            sessionController.loadedUserKey,
            sessionController.loadedUserCertificate,
            this.downloadIntentionId
        )
        this.validated = true;
    }

    public initPaymentHandler = (
        ip: string,
        paymentSize: number,
        magneticLink: string,
        downloadIntentionId: string) => {
        const hashChainSize = paymentSize
        this.hashChain = new HashChain();
        this.hashChain.initHashChain(hashChainSize);
        this.commitment = new Commitment();
        this.receiverIp = ip;
        this.magneticLink = magneticLink;
        this.downloadIntentionId = downloadIntentionId;
        this.validated = false;
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
