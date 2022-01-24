import WebSocket from "ws";
import { PAYFLUXO_EXTERNAL_PORT } from "../../config";
import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { ConnectionNotifier } from "../../p2p/controllers/ConnectionNotifier";
import { ConnectionResource } from "../../p2p/controllers/ConnectionResource";
import { CertificateResponse } from "../../p2p/models/CertificateResponse";
import { CommitmentMessage } from "../../p2p/models/CommitmentMessage";
import { CommitmentResponseStatusEnum, CommitResponseContent } from "../../p2p/models/CommitResponse";
import { Observer } from "../../p2p/models/ObserverPattern";
import { IPayfluxoRequestModel, PayfluxoRequestsTypesEnum } from "../../p2p/models/PayfluxoRequestModel";
import { getConnectionHash, getPeerHash } from "../../p2p/util/peerHash";
import { IDownloadedBlockMessageData } from "../../torrente/messages/models/DownloadedBlockMessage";
import { PaymentHandler } from "../controllers/PaymentHandler";
import { SessionController } from "../controllers/SessionController";
import { Protocol } from "../models/Protocol";
import { validateIp } from "../utils/IpValidator";
import { MicroPaymentProtocol } from "./MicroPaymentProtocol";

export class CommitmentRegisterProtocol implements Protocol {
    private downloadData: IDownloadedBlockMessageData;

    activate = () => {
        const sessionController = SessionController.getInstance();
        const validatedIp: string = validateIp(this.downloadData.uploaderIp);
        const connectionHash = getConnectionHash(this.downloadData.uploaderIp, PAYFLUXO_EXTERNAL_PORT);
        const peerHash = getPeerHash(this.downloadData.uploaderIp, this.downloadData.magneticLink)
        sessionController.addPeerCorrespondence(peerHash, connectionHash)
        const declarationId = sessionController.downloadDeclarationIntentions[this.downloadData.magneticLink];
        sessionController.addPaymentHandlers(
            this.downloadData.uploaderIp,
            this.downloadData.fileSize,
            this.downloadData.magneticLink,
            declarationId
        )
        const payfluxoServer = PayfluxoServer.getInstance();
        const connectionsMap = payfluxoServer.getConnectionsMap();
        const wsUploader = new WebSocket(`ws://${validatedIp}:${PAYFLUXO_EXTERNAL_PORT}`)
        wsUploader.on('open', (ws: WebSocket) => {
            connectionsMap.addConnection(connectionHash, wsUploader, this.downloadData.uploaderIp, PAYFLUXO_EXTERNAL_PORT)
            const connection = connectionsMap.getConnection(connectionHash);
            connection.requestCertificate();
            const certificateReceiverWaiter = new CertificateReceiverWaiter(connection, this.downloadData);
            connection.notifier.attach(certificateReceiverWaiter);
        })
    }

    constructor(downloadData: IDownloadedBlockMessageData) {
        this.downloadData = downloadData;
    }
}

class CertificateReceiverWaiter implements Observer {
    private connectionResource: ConnectionResource
    private downloadData: IDownloadedBlockMessageData;

    update(subject: ConnectionNotifier): void {
        const message = subject.getMessage<CertificateResponse>();
        if (message.type === PayfluxoRequestsTypesEnum.CertificateResponse){
            const peerHash = getPeerHash(this.downloadData.uploaderIp, this.downloadData.magneticLink);
            const sessionController = SessionController.getInstance();
            const paymentHandler = sessionController.paymentHandlers[peerHash]
            paymentHandler.validatePaymentHandler(message.data.certificate)
            const commitment = paymentHandler.commitment.commitmentMessage;
            this.connectionResource.proposeCommitment(commitment);
            const commitmentAcceptanceWaiter = new CommitmentAcceptanceWaiter(
                paymentHandler, this.connectionResource, this.downloadData
            );
            this.connectionResource.notifier.detach(this)
            this.connectionResource.notifier.attach(commitmentAcceptanceWaiter);
        }
    }

    constructor (connectionResource: ConnectionResource, downloadData: IDownloadedBlockMessageData) {
        this.connectionResource = connectionResource;
        this.downloadData = downloadData;
    }
}

class CommitmentAcceptanceWaiter implements Observer {
    paymentHandler: PaymentHandler;
    connection: ConnectionResource;
    downloadData: IDownloadedBlockMessageData;

    update(subject: ConnectionNotifier): void {
        const commitmentResponse = subject.getMessage<CommitResponseContent>();
        if (commitmentResponse.type === PayfluxoRequestsTypesEnum.CommitmentAcceptance){
            switch (commitmentResponse.data.result){
                case CommitmentResponseStatusEnum.Accepted:
                    const micropaymentProtocol = new MicroPaymentProtocol(this.paymentHandler, this.connection);
                    this.paymentHandler.activatePaymentProtocol(micropaymentProtocol);
                    micropaymentProtocol.activate();
                    break;
                case CommitmentResponseStatusEnum.Denied:
                    const retryCommitmentProtocol = new CommitmentRegisterProtocol(this.downloadData);
                    retryCommitmentProtocol.activate();
                    break;
            }
            this.connection.notifier.detach(this);
        }
    }

    constructor (paymentHandler: PaymentHandler, connection: ConnectionResource, downloadData: IDownloadedBlockMessageData) {
        this.paymentHandler = paymentHandler;
        this.connection = connection;
        this.downloadData = downloadData;
    }
}
