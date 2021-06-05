import axios from "axios";
import { PAYFLUXO_LISTENING_PORT } from "../../config";
import { Commitment, CommitmentContent, CommitmentMessage } from "../models/Commitment";
import { SuccesfulCommitResponse, WrongCommitmentResponse } from "../models/CommitResponse";
import { PaymentHashMap, ReceiverHashMap } from "../models/HandlersHashMap";
import { MicropaymentRequest } from "../models/MicropaymentRequest";
import { CommitmentNotFoundResponse, SuccesfulPaymentResponse, WrongPaymentResponse } from "../models/PaymentResponse";
import { getPeerHash } from "../utils/peerHash";
import { PaymentHandler } from "./PaymentHandler";
import { ReceiverHandler } from "./ReceiverHandler";

export class SessionController {
    loadedUserKey: string;
    loadedUserCertificate: string;
    loadedUserMSP: string;
    receivingListeners: ReceiverHashMap;
    paymentHandlers: PaymentHashMap;

    public constructor (userPrivateKey: string, userCertificate: string, userMSP: string){
        this.loadedUserKey = userPrivateKey;
        this.loadedUserCertificate = userCertificate;
        this.loadedUserMSP = userMSP;
        this.receivingListeners = {};
        this.paymentHandlers = {};
    }

    public handleReceive(micropaymentRequest: MicropaymentRequest, requesterIp: string){
        const payerHash = getPeerHash(requesterIp, micropaymentRequest.magneticLink);

        const receiverListener = this.receivingListeners[payerHash];
        if (receiverListener){
            if (receiverListener.verifyPayment(micropaymentRequest.hashLink, micropaymentRequest.hashLinkIndex)){
                return SuccesfulPaymentResponse;
            }
            return WrongPaymentResponse;
        }
        return CommitmentNotFoundResponse;
    }

    public async handleCommit(commitmentMessage: CommitmentMessage, requesterIp: string){
        // TODO
        // const peerEndpoint = `${requesterIp}:${PAYFLUXO_EXTERNAL_PORT}/certificate` // prod
        const peerEndpoint = `http://${requesterIp}:${PAYFLUXO_LISTENING_PORT}/certificate` // teste
        const keyResponse = await axios.get(peerEndpoint)
        const certificate = keyResponse.data['certificate']

        const commitmentIsValid = Commitment.validateSignature(commitmentMessage, certificate)
        // get key from peer

        if (commitmentIsValid){
            this.addReceivingListener(
                requesterIp,
                certificate,
                commitmentMessage.content
            )
            return SuccesfulCommitResponse;
        }
        else{
            return WrongCommitmentResponse;
        }
    }

    public addReceivingListener(payerIp: string, payerPublicKey: string, commitment: CommitmentContent){
        const newReceiverListener = new ReceiverHandler(
            payerIp, 
            payerPublicKey,
            commitment
            );
        const magneticLink = commitment.magneticLink
        const receiverHash = getPeerHash(payerIp, magneticLink);

        this.receivingListeners[receiverHash] = newReceiverListener;
    }

    public addpaymentHandlers(
        receiverIp: string, 
        receiverPublicKey: string, 
        numberOfBlocks: number,
        magneticLink: string
        ){
        const newPaymentController = new PaymentHandler(
            receiverIp,
            receiverPublicKey, 
            numberOfBlocks, 
            this.loadedUserKey,
            magneticLink,
            this.loadedUserCertificate)

        const receiverHash = getPeerHash(receiverIp, magneticLink);

        this.paymentHandlers[receiverHash] = newPaymentController;
    }
}