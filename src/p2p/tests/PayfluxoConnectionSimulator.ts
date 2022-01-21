import { PAYFLUXO_EXTERNAL_PORT } from "../../config";
import WebSocket from "ws";
import { PayfluxoInterface } from "../../p2p/models/ConnectionResources";

export class PayfluxoConnectionSimulator implements PayfluxoInterface {
    payfluxoSocket: WebSocket

    public constructor() { 
        this.initConnection();
        this.payfluxoSocket.onopen = this.onOpen;
        this.payfluxoSocket.onmessage = this.onMessage;
        this.payfluxoSocket.onclose = this.onClose;
        this.payfluxoSocket.onerror = this.onError;
    }
    public requestCertificate: () => {};
    public respondCertificate: () => {};
    public sendPayment: () => {};
    public acceptPayment: () => {};
    public rejectPayment: () => {};
    public proposeCommitment: () => {};
    public acceptCommitment: () => {};
    public rejectCommitment: () => {};

    private initConnection = () => {
        this.payfluxoSocket = new WebSocket(`ws://127.0.0.1:${PAYFLUXO_EXTERNAL_PORT}`);
    }

    private onOpen = (event) => {
        console.log("[INFO] Connected to Payfluxo");
    }

    private onMessage = (event: WebSocket.MessageEvent) => {
        console.log(event.data)
    }

    private onClose = (event) => {
        console.log("Disconnected from Payfluxo")
    }

    private onError = (event) => {
        console.log(event)
    }

    public close = () => {
        this.payfluxoSocket.close();
    }
}