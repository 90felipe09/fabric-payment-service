import { PayfluxoConsole } from "../../console/Console";
import { ConnectionNotifier } from "../../p2p/controllers/ConnectionNotifier";
import { ConnectionResource } from "../../p2p/controllers/ConnectionResource";
import { MicropaymentRequest } from "../../p2p/models/MicropaymentRequest";
import { Observer } from "../../p2p/models/ObserverPattern";
import { IPayfluxoRequestModel, PayfluxoRequestsTypesEnum } from "../../p2p/models/PayfluxoRequestModel";
import { NotificationHandler } from "../../torrente/notification/NotificationHandler";
import { PaymentHandler } from "../controllers/PaymentHandler";
import { ReceiverHandler } from "../controllers/ReceiverHandler";
import { Protocol } from "../models/Protocol";

export class MicroPaymentProtocol implements Protocol{
    paymentHandler: PaymentHandler;
    connection: ConnectionResource;
    
    public activate = () => {
        const [hashLinkToPay, hashLinkIndex] = this.paymentHandler.payHash();
        const magneticLink = this.paymentHandler.commitment.commitmentMessage.data.data_id
        const paymentContent: MicropaymentRequest = {
            hashLink: hashLinkToPay,
            hashLinkIndex: hashLinkIndex,
            magneticLink: magneticLink
        }
        this.sendMicroPayment(paymentContent);
    }

    private sendMicroPayment = (message: MicropaymentRequest) => {
        const console = PayfluxoConsole.getInstance();
        this.connection.sendPayment(message.hashLink, message.hashLinkIndex, message.magneticLink)
        console.debug(`Paid for a block from torrent ${message.magneticLink} to ${this.connection.peerHash}`)
    }

    constructor (paymentHandler: PaymentHandler, connection: ConnectionResource) {
        this.paymentHandler = paymentHandler;
        this.connection = connection;
    }
}

export class ReceiveMicropaymentWaiter implements Observer {
    private connectionResource: ConnectionResource
    private receiverListener: ReceiverHandler;

    update(subject: ConnectionNotifier): void {
        const message = subject.getMessage<MicropaymentRequest>();
        const console = PayfluxoConsole.getInstance();
        if (message.type === PayfluxoRequestsTypesEnum.MicroPaymentRequest){
            const micropaymentRequest = subject.getMessage<MicropaymentRequest>().data;
            if (this.receiverListener.lastHashIndex >= micropaymentRequest.hashLinkIndex){
                console.debug(`Received paymemnt out of order: ${micropaymentRequest.hashLinkIndex}/${this.receiverListener.lastHashIndex}.`)
            }
            else if (this.receiverListener.verifyPayment(micropaymentRequest.hashLink, micropaymentRequest.hashLinkIndex)){
                console.debug(`Received valid payment: ${micropaymentRequest.hashLinkIndex}.`)
                const notificationHandler = NotificationHandler.getInstance();
                notificationHandler.notifyPayment({
                    blocksPaid: micropaymentRequest.hashLinkIndex,
                    magneticLink: micropaymentRequest.magneticLink,
                    payerIp: this.connectionResource.ip
                })
            }
            else{
                console.debug(`Invalid payment: ${micropaymentRequest.hashLinkIndex}/${this.receiverListener.lastHashIndex}`)
            }
        }
    }

    constructor (connectionResource: ConnectionResource, receiverListener: ReceiverHandler) {
        this.connectionResource = connectionResource;
        this.receiverListener = receiverListener;
    }
}
