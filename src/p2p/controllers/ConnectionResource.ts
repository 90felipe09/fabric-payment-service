import WebSocket from "ws";
import { PayfluxoConsole } from "../../console/Console";
import { SessionController } from "../../payment/controllers/SessionController";
import { CommitmentReceivementWaiter } from "../../payment/rules/CommitmentReceivementProtocol";
import { CertificateRequest } from "../models/CertificateRequest";
import { CertificateResponse } from "../models/CertificateResponse";
import { CommitmentMessage } from "../models/CommitmentMessage";
import { SuccesfulCommitResponse, WrongCommitmentResponse } from "../models/CommitResponse";
import { PayfluxoInterface } from "../models/ConnectionResources";
import { MicropaymentRequest } from "../models/MicropaymentRequest";
import { IPayfluxoRequestModel, PayfluxoRequestsTypesEnum } from "../models/PayfluxoRequestModel";
import { getConnectionHash } from "../util/peerHash";
import { ConnectionNotifier } from "./ConnectionNotifier";

export class ConnectionResource implements PayfluxoInterface {
    public ws: WebSocket;
    public ip: string;
    public port: number;
    public peerHash: string
    public notifier: ConnectionNotifier;

    constructor(ws: WebSocket, ip: string, port: number){
        ws.on('message', (data: WebSocket.Data) => this.handleIncomingMessage(data));
        this.ws = ws;
        this.ip = ip;
        this.port = port;
        this.peerHash = getConnectionHash(ip, port);
        this.notifier = new ConnectionNotifier();
    }

    private handleIncomingMessage = (data: WebSocket.Data) => {
        const console = PayfluxoConsole.getInstance();
        console.debug(`Received message from ${this.ip}:${this.port}`)
        const requestObject: IPayfluxoRequestModel<any> = JSON.parse(data.toString())
        const requestType: string = requestObject.type;
        console.debug(`Type: ${requestType}`)
        switch (requestType){
            case PayfluxoRequestsTypesEnum.CommitmentMessage:
                const commitmentReceivementProtocol = new CommitmentReceivementWaiter(this);
                this.notifier.attach(commitmentReceivementProtocol);
                break;
            case PayfluxoRequestsTypesEnum.CertificateRequest:
                this.respondCertificate();
                break;
        }
        this.notifier.updateMessage(requestObject);
    }

    public requestCertificate = () => {
        const certificateRequest: IPayfluxoRequestModel<CertificateRequest> = {
            type: PayfluxoRequestsTypesEnum.CertificateRequest,
            data: {}
        };
        const requestJSON = JSON.stringify(certificateRequest)
        this.ws.send(requestJSON)
    };

    public respondCertificate = () => {
        const certificateResponse: IPayfluxoRequestModel<CertificateResponse> = {
            data: {    
                certificate: SessionController.getInstance().loadedUserCertificate
            },
            type: PayfluxoRequestsTypesEnum.CertificateResponse
        };
        const jsonCertificateResponse = JSON.stringify(certificateResponse)
        this.ws.send(jsonCertificateResponse)
    };

    public sendPayment = (hashLinkToPay: string, hashLinkIndex: number, magneticLink: string) => {
        const paymentContent: MicropaymentRequest = {
            hashLink: hashLinkToPay,
            hashLinkIndex: hashLinkIndex,
            magneticLink: magneticLink
        }
        const paymentMessage: IPayfluxoRequestModel<MicropaymentRequest> = {
            data: paymentContent,
            type: PayfluxoRequestsTypesEnum.MicroPaymentRequest
        }
        const paymentMessageString = JSON.stringify(paymentMessage)
        this.ws.send(paymentMessageString);
    };

    public acceptPayment = () => {};

    public rejectPayment = () => {};

    public proposeCommitment = (commitment: CommitmentMessage) => {
        const message: IPayfluxoRequestModel<CommitmentMessage> = {
            type: PayfluxoRequestsTypesEnum.CommitmentMessage,
            data: commitment
        }
        const commitmentString = JSON.stringify(message);
        this.ws.send(commitmentString);
    };

    public acceptCommitment = () => {
        const responseString = JSON.stringify(SuccesfulCommitResponse);
        this.ws.send(responseString);
    };

    public rejectCommitment = () => {
        const responseString = JSON.stringify(WrongCommitmentResponse);
        this.ws.send(responseString);
    };     
}
