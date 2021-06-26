import axios from "axios";
import http from 'http';
import { PAYFLUXO_USING_PORT } from "../../config";
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

    payfluxoServer: http.Server;

    public constructor (userPrivateKey: string, userCertificate: string, userMSP: string, payfluxoServer: http.Server){
        this.loadedUserKey = userPrivateKey;
        this.loadedUserCertificate = userCertificate;
        this.loadedUserMSP = userMSP;
        this.receivingListeners = {};
        this.paymentHandlers = {};

        this.payfluxoServer = payfluxoServer;
    }

    public closeServer = () => {
        console.log("[INFO] Closing payfluxo server")
        this.loadedUserKey = "";
        this.loadedUserCertificate = "";
        this.loadedUserMSP = "";
        this.receivingListeners = {};
        this.paymentHandlers = {};
        this.payfluxoServer.close();
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
        const peerEndpoint = `http://${requesterIp}:${PAYFLUXO_USING_PORT}/certificate`;
        const keyResponse = await axios.get(peerEndpoint)
        const certificate = keyResponse.data['certificate']

        const commitmentIsValid = Commitment.validateSignature(commitmentMessage, certificate)
        
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

    public recoverReceivingListener(
        payerIp: string,
        payerPublicKey: string,
        commitment: CommitmentContent,
        lastHashReceived: string,
        lastHashReceivedIndex: number,
        lastHashRedeemed: string,
        lastHashRedeemedIndex: number
        ){
        const newReceiverListener = new ReceiverHandler(
            payerIp, 
            payerPublicKey,
            commitment
            );
        const magneticLink = commitment.magneticLink
        const receiverHash = getPeerHash(payerIp, magneticLink);

        newReceiverListener.loadState(
            lastHashReceived,
            lastHashReceivedIndex,
            lastHashRedeemed,
            lastHashRedeemedIndex)

        this.receivingListeners[receiverHash] = newReceiverListener;
    }

    public addpaymentHandlers(
        receiverIp: string, 
        receiverPublicKey: string, 
        numberOfBlocks: number,
        magneticLink: string
        ){
        const newPaymentController = new PaymentHandler()
    
        newPaymentController.initPaymentHandler(
            receiverIp, 
            receiverPublicKey, 
            numberOfBlocks,
            this.loadedUserKey,
            magneticLink,
            this.loadedUserCertificate)

        const receiverHash = getPeerHash(receiverIp, magneticLink);

        this.paymentHandlers[receiverHash] = newPaymentController;
    }

    public recoverPaymentHandler(
        receiverIp: string, 
        magneticLink: string,
        lastHash: string,
        lastHashIndex: number,
        commitment: CommitmentMessage,
        hashChain: string[]
    ) {
        const newPaymentController = new PaymentHandler()

        newPaymentController.loadPaymentHandler(receiverIp, commitment, hashChain, lastHash, lastHashIndex);

        const receiverHash = getPeerHash(receiverIp, magneticLink);

        this.paymentHandlers[receiverHash] = newPaymentController;
    }
}