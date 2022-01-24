import { ConnectionNotifier } from "../../p2p/controllers/ConnectionNotifier";
import { ConnectionResource } from "../../p2p/controllers/ConnectionResource";
import { CertificateResponse } from "../../p2p/models/CertificateResponse";
import { CommitmentMessage } from "../../p2p/models/CommitmentMessage";
import { Observer } from "../../p2p/models/ObserverPattern";
import { PayfluxoRequestsTypesEnum } from "../../p2p/models/PayfluxoRequestModel";
import { getPeerHash } from "../../p2p/util/peerHash";
import { SessionController } from "../controllers/SessionController";
import { Commitment } from "../models/Commitment";
import { isIntentionValid } from "../utils/IntentionIsValid";
import { ReceiveMicropaymentWaiter } from "./MicroPaymentProtocol";

export class CommitmentReceivementWaiter implements Observer {
    private connectionResource: ConnectionResource;

    public constructor(connectionResource: ConnectionResource) {
        this.connectionResource = connectionResource;
    }

    update(subject: ConnectionNotifier): void {
        const commitmentMessage = subject.getMessage<CommitmentMessage>()
        if (commitmentMessage.type === PayfluxoRequestsTypesEnum.CommitmentMessage){
            this.connectionResource.requestCertificate();
            const certificatePayerWaiter = new CertificatePayerWaiter(this.connectionResource, commitmentMessage.data);
            this.connectionResource.notifier.detach(this);
            this.connectionResource.notifier.attach(certificatePayerWaiter);
        }
    }
}

export class CertificatePayerWaiter implements Observer {
    private connectionResource: ConnectionResource
    private commitment: CommitmentMessage;

    update(subject: ConnectionNotifier): void {
        const message = subject.getMessage<CertificateResponse>()
        if (message.type === PayfluxoRequestsTypesEnum.CertificateResponse){
            const certificate = message.data.certificate
            const commitmentIsValid = Commitment.validateSignature(this.commitment, certificate)
            const intentionIsValid = isIntentionValid(this.commitment.data.payment_intention_id)
            const sessionController = SessionController.getInstance();
            if (commitmentIsValid && intentionIsValid){
                sessionController.addReceivingListener(
                    this.connectionResource.ip,
                    certificate,
                    this.commitment
                )
                const peerHash = getPeerHash(this.connectionResource.ip, this.commitment.data.data_id)
                const receiverListener = sessionController.receivingListeners[peerHash]
                const paymentReceiverWaiter = new ReceiveMicropaymentWaiter(this.connectionResource, receiverListener)
                this.connectionResource.notifier.detach(this);
                this.connectionResource.notifier.attach(paymentReceiverWaiter);
                this.connectionResource.acceptCommitment();
            }
            else{
                this.connectionResource.notifier.detach(this);
                this.connectionResource.rejectCommitment();
            }
        }
    }

    constructor (connectionResource: ConnectionResource, commitment: CommitmentMessage) {
        this.connectionResource = connectionResource;
        this.commitment = commitment;
    }
}
