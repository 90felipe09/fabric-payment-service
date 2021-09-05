import axios from "axios";
import http from 'http';
import { PAYFLUXO_USING_PORT, PAYMENT_SERVICE } from "../../config";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { IDownloadIntentionMessageData } from "../../torrente/messages/models/DownloadIntentionMessage";
import { Commitment, CommitmentMessage } from "../models/Commitment";
import { SuccesfulCommitResponse, WrongCommitmentResponse } from "../models/CommitResponse";
import { PaymentHashMap, ReceiverHashMap } from "../models/HandlersHashMap";
import { MicropaymentRequest } from "../models/MicropaymentRequest";
import { CommitmentNotFoundResponse, SuccesfulPaymentResponse, WrongPaymentResponse } from "../models/PaymentResponse";
import { CreatePaymentIntentionArguments, PaymentIntentionResponse, PaymentServiceInterface, RedeemArguments } from "../models/PaymentServiceInterface";
import { TorrenteWallet } from "../models/TorrenteWallet";
import { getPeerHash } from "../utils/peerHash";
import { getAddress } from "../utils/userAddress";
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

    paymentService: PaymentServiceInterface;

    public constructor (userPrivateKey: string, userCertificate: string, userMSP: string, payfluxoServer: http.Server){
        this.loadedUserKey = userPrivateKey;
        this.loadedUserCertificate = userCertificate;
        this.loadedUserMSP = userMSP;
        this.receivingListeners = {};
        this.paymentHandlers = {};

        this.payfluxoServer = payfluxoServer;

        const authData: IAuthenticatedMessageData = {
            certificate: userCertificate,
            mspId: userMSP,
            privateKey: userPrivateKey
        }

        this.paymentService = PAYMENT_SERVICE

        this.paymentService.init(authData);

        this.downloadDeclarationIntentions = {};
    }

    public getWallet = async (): Promise<TorrenteWallet> => {
        const accountId: string = getAddress(this.loadedUserCertificate);
        const account = await this.paymentService.evaluateAccount(accountId);
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
        try{
            const paymentIntentionsPromises: Promise<PaymentIntentionResponse>[] = Object.values(
                this.downloadDeclarationIntentions).map(downloadIntentionId => {
                    return this.paymentService.invokeReadPaymentIntention(downloadIntentionId);
            })
            const paymentIntentions = await Promise.all(paymentIntentionsPromises);
            const frozenValues: number = paymentIntentions.reduce((acc, paymentIntention) => {
                acc += paymentIntention.available_funds;
                return acc;
            }, 0);
            return frozenValues;
        }
        catch {
            throw (Error("[ERROR] Couldn't fetch payment intentions."))
        }
    }

    private getReedemableValues = async (): Promise<number> => {
        try{
            const reedemableHashesNumber: number = Object.values(this.receivingListeners).reduce((acc, receiverListener) => {
                acc += (receiverListener.lastHashIndex - receiverListener.lastHashRedeemedIndex);
                return acc;
            }, 0);
            const piecePrice = await this.paymentService.queryGetPiecePrice();
            return reedemableHashesNumber * piecePrice;
        }
        catch{
            throw (Error("[ERROR] Couldn't fetch piece price."))
        }
    }

    public declareNewPaymentIntention = async (data: IDownloadIntentionMessageData ) => {
        const piecePrice = await this.paymentService.queryGetPiecePrice();
        const paymentIntentionArgs: CreatePaymentIntentionArguments = {
            magneticLink: data.magneticLink,
            valueToFreeze: data.piecesNumber * piecePrice
        }
        const paymentIntention = await this.paymentService.invokeCreatePaymentIntention(paymentIntentionArgs);
        if (paymentIntention.id) {
            this.downloadDeclarationIntentions[data.magneticLink] = paymentIntention.id;
        }

        return paymentIntention;
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
                receiverListener.redeemTimer.resetTimer();
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

    public handleRedeemValues = async (receiverListener: ReceiverHandler) => {
        const redeemArguments: RedeemArguments = {
            commitment: receiverListener.commitment,
            hashLink: receiverListener.lastHash,
            hashLinkIndex: receiverListener.lastHashIndex
        }
        await this.paymentService.invokeRedeem(redeemArguments);
        receiverListener.redeemTimer.stopTimer();
    }

    public addReceivingListener(payerIp: string, payerPublicKey: string, commitment: CommitmentMessage){
        const newReceiverListener = new ReceiverHandler(
            payerIp, 
            payerPublicKey,
            commitment,
            this.handleRedeemValues
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
            commitment,
            this.handleRedeemValues
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
            const declarationReference = await this.paymentService.invokeReadPaymentIntention(intentionId);
            const isNotExpired = new Date(Date.parse(declarationReference.expiration_date)) > new Date();
            return isNotExpired;
        }
        return false;
    }
}

function getAddressthis(loadedUserCertificate: any): string {
    throw new Error("Function not implemented.");
}
