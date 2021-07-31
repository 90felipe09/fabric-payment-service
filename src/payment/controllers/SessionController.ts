import axios from "axios";
import sha256 from 'crypto-js/sha256';
import http from 'http';
import { PAYFLUXO_USING_PORT } from "../../config";
import { AccountContract } from "../../hyperledger/smart-contracts/AccountContract";
import { PaymentIntentionContract, PaymentIntentionResponse } from "../../hyperledger/smart-contracts/PaymentIntentionContract";
import { RedeemContract } from "../../hyperledger/smart-contracts/RedeemContract";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { Commitment, CommitmentMessage } from "../models/Commitment";
import { SuccesfulCommitResponse, WrongCommitmentResponse } from "../models/CommitResponse";
import { PaymentHashMap, ReceiverHashMap } from "../models/HandlersHashMap";
import { MicropaymentRequest } from "../models/MicropaymentRequest";
import { CommitmentNotFoundResponse, SuccesfulPaymentResponse, WrongPaymentResponse } from "../models/PaymentResponse";
import { TorrenteWallet } from "../models/TorrenteWallet";
import { getPeerHash } from "../utils/peerHash";
import { PaymentHandler } from "./PaymentHandler";
import { ReceiverHandler } from "./ReceiverHandler";

export type DownloadDeclarationIntentionsMap = {
    [magneticLink: string]: string,
}
export class SessionController {
    loadedUserKey: string;
    loadedUserCertificate: string;
    loadedUserMSP: string;
    receivingListeners: ReceiverHashMap;
    paymentHandlers: PaymentHashMap;

    payfluxoServer: http.Server;

    downloadDeclarationIntentions: DownloadDeclarationIntentionsMap;

    redeemContract: RedeemContract;
    paymentIntentionContract: PaymentIntentionContract;
    accountContract: AccountContract;

    public constructor (userPrivateKey: string, userCertificate: string, userMSP: string, payfluxoServer: http.Server){
        this.loadedUserKey = userPrivateKey;
        this.loadedUserCertificate = userCertificate;
        this.loadedUserMSP = userMSP;
        this.receivingListeners = {};
        this.paymentHandlers = {};

        this.payfluxoServer = payfluxoServer;

        const authData: IAuthenticatedMessageData = {
            certificate: this.loadedUserCertificate,
            mspId: this.loadedUserMSP,
            privateKey: this.loadedUserKey
        }

        this.redeemContract = new RedeemContract(authData);
        this.paymentIntentionContract = new PaymentIntentionContract(authData);
        this.accountContract = new AccountContract(authData);
    }

    public getWallet = async (): Promise<TorrenteWallet> => {
        const accountId: string = sha256(this.loadedUserCertificate).toString();
        const account = await this.accountContract.evaluateAccount(accountId);
        const availableFunds: number = parseFloat(account.balance);
        const reedemableValues: number = await this.getReedemableValues();
        const frozenValues: number = await this.getFrozenValues();
        return {
            available: availableFunds,
            frozen: frozenValues,
            redeemable: reedemableValues
        }
    }

    private getFrozenValues = async (): Promise<number> => {
        const paymentIntentionsPromises: Promise<PaymentIntentionResponse>[] = Object.values(
            this.downloadDeclarationIntentions).map(downloadIntentionId => {
                return this.paymentIntentionContract.invokeReadPaymentIntention(downloadIntentionId);
        })
        const paymentIntentions = await Promise.all(paymentIntentionsPromises);
        const frozenValues: number = paymentIntentions.reduce((acc, paymentIntention) => {
            acc += paymentIntention.available_funds;
            return acc;
        }, 0);
        return frozenValues;
    }

    private getReedemableValues = async (): Promise<number> => {
        const reedemableHashesNumber: number = Object.values(this.receivingListeners).reduce((acc, receiverListener) => {
            acc += (receiverListener.lastHashIndex - receiverListener.lastHashRedeemedIndex);
            return acc;
        }, 0);
        const piecePrice = await this.paymentIntentionContract.queryGetPiecePrice();
        return reedemableHashesNumber * piecePrice;
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
        
        const isIntentionValid = this.isIntentionValid(commitmentMessage.data.payment_intention_id)

        if (commitmentIsValid && isIntentionValid){
            this.addReceivingListener(
                requesterIp,
                certificate,
                commitmentMessage
            )
            return SuccesfulCommitResponse;
        }
        else{
            return WrongCommitmentResponse;
        }
    }

    public addReceivingListener(payerIp: string, payerPublicKey: string, commitment: CommitmentMessage){
        const newReceiverListener = new ReceiverHandler(
            payerIp, 
            payerPublicKey,
            commitment
            );
        const magneticLink = commitment.data.data_id
        const receiverHash = getPeerHash(payerIp, magneticLink);

        this.receivingListeners[receiverHash] = newReceiverListener;
    }

    public recoverReceivingListener(
        payerIp: string,
        payerPublicKey: string,
        commitment: CommitmentMessage,
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
        const magneticLink = commitment.data.data_id
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
        magneticLink: string,
        downloadIntentionId: string
        ){
        const newPaymentController = new PaymentHandler()
    
        newPaymentController.initPaymentHandler(
            receiverIp, 
            receiverPublicKey, 
            numberOfBlocks,
            this.loadedUserKey,
            magneticLink,
            this.loadedUserCertificate,
            downloadIntentionId)

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

    public recoverDownloadIntentions(
        downloadIntentions: DownloadDeclarationIntentionsMap
    ) {
        this.downloadDeclarationIntentions = downloadIntentions;
    }

    public isIntentionValid = async (intentionId: string) => {
        if (intentionId) {
            const declarationReference = await this.paymentIntentionContract.invokeReadPaymentIntention(intentionId);
            const isNotExpired = new Date(Date.parse(declarationReference.expiration_date)) > new Date();
            return isNotExpired;
        }
        return false;
    }
}