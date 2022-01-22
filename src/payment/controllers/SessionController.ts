import WebSocket from 'ws';
import { PAYMENT_SERVICE } from "../../config";
import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { ConnectionResource } from '../../p2p/controllers/ConnectionResource';
import { ConnectionsMap } from "../../p2p/controllers/ConnectionsMap";
import { CommitmentMessage } from '../../p2p/models/CommitmentMessage';
import { getPeerHash } from "../../p2p/util/peerHash";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { PaymentHashMap, ReceiverHashMap } from "../models/HandlersHashMap";
import { PaymentServiceInterface } from "../models/PaymentServiceInterface";
import { UserIdentification } from "../models/UserIdentification";
import { PaymentHandler } from "./PaymentHandler";
import { ReceiverHandler } from "./ReceiverHandler";

export type DownloadDeclarationIntentionsMap = {
    [magneticLink: string]: string,
}

export type HashCorrespondenceMap = {
    [peerHash: string]: string
}


export class SessionController {
    loadedUserKey: string;
    loadedUserCertificate: string;
    loadedUserMSP: string;
    receivingListeners: ReceiverHashMap;
    paymentHandlers: PaymentHashMap;
    peerConnectionCorrespondenceMap: HashCorrespondenceMap;

    payfluxoServer: WebSocket.Server;

    downloadDeclarationIntentions: DownloadDeclarationIntentionsMap;

    paymentService: PaymentServiceInterface;

    connectionsMap: ConnectionsMap;

    private static initializationResolver: (value?: unknown) => void = () => {};
    private static endResolver: (value?: unknown) => void = () => {};

    private static instance: SessionController;

    public static getInstance = (): SessionController => {
        if (!SessionController.instance) {
            throw Error("SessionController has not been initialized.");
        }

        return SessionController.instance
    }

    public static destroyInstance = () => {
        SessionController.endResolver();
        SessionController.instance = undefined;
    }

    public constructor (userId: UserIdentification){
        SessionController.instance = this;

        this.loadedUserKey = userId.privateKey;
        this.loadedUserCertificate = userId.certificate;
        this.loadedUserMSP = userId.orgMSPID;

        this.receivingListeners = {};
        this.paymentHandlers = {};
        this.connectionsMap = new ConnectionsMap();

        const authData: IAuthenticatedMessageData = {
            certificate: userId.certificate,
            mspId: userId.orgMSPID,
            privateKey: userId.privateKey
        }

        this.paymentService = PAYMENT_SERVICE;
        this.paymentService.init(authData);

        this.downloadDeclarationIntentions = {};
        this.peerConnectionCorrespondenceMap = {};

        SessionController.initializationResolver();
    }

    public static waitTillInitialized = async(): Promise<void> => {
        if (!!SessionController.instance){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        else{
            const initializationPromise = new Promise((resolve: (value: void) => void, _reject) => {
                SessionController.initializationResolver = resolve;
            })
            return initializationPromise;
        }
    }

    public static waitTillClosed = async(): Promise<void> => {
        if (!SessionController.instance){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        else{
            const endPromise = new Promise((resolve: (value: void) => void, _reject) => {
                SessionController.endResolver = resolve;
            })
            return endPromise;
        }
    }

    public addPeerCorrespondence = (peerHash: string, connectionHash: string) => {
        this.peerConnectionCorrespondenceMap[peerHash] = connectionHash;
    }

    public getConnectionFromPeerHash = (peerHash: string): ConnectionResource => {
        const connectionHash = this.peerConnectionCorrespondenceMap[peerHash];
        const connectionMap = PayfluxoServer.getInstance().getConnectionsMap();
        return connectionMap.getConnection(connectionHash);
    }

    public closeServer = () => {
        console.log("[INFO] Closing payfluxo server")
        this.loadedUserKey = "";
        this.loadedUserCertificate = "";
        this.loadedUserMSP = "";
        this.receivingListeners = {};
        this.paymentHandlers = {};
        PayfluxoServer.closeServer();
        SessionController.destroyInstance();
    }

    public addReceivingListener(payerIp: string, payerPublicKey: string, commitment: CommitmentMessage){
        const newReceiverListener = new ReceiverHandler(
            payerIp, 
            payerPublicKey,
            commitment);
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
            commitment);
        const magneticLink = commitment.data.data_id
        const receiverHash = getPeerHash(payerIp, magneticLink);

        newReceiverListener.loadState(
            lastHashReceived,
            lastHashReceivedIndex,
            lastHashRedeemed,
            lastHashRedeemedIndex)

        this.receivingListeners[receiverHash] = newReceiverListener;
    }

    public addPaymentHandlers(
        receiverIp: string,
        numberOfBlocks: number,
        magneticLink: string,
        downloadIntentionId: string
        ){
        const newPaymentController = new PaymentHandler()
    
        newPaymentController.initPaymentHandler(
            receiverIp,
            numberOfBlocks,
            magneticLink,
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
}
