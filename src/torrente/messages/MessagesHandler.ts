import { PAYFLUXO_EXTERNAL_PORT } from "../../config";
import { getConnectionHash, startPayfluxoServer } from "../../payment/connections/PayfluxoServer";
import { PaymentHandler } from '../../payment/controllers/PaymentHandler';
import { SessionController } from "../../payment/controllers/SessionController";
import { SessionLoader } from '../../payment/data/SessionLoader';
import { SessionSaver } from '../../payment/data/SessionSaver';
import { getCertificate } from '../../payment/messages/CertificateRequester';
import { ConnectionContext } from '../../payment/models/ConnectionsMap';
import { MicropaymentRequest } from "../../payment/models/MicropaymentRequest";
import { IPayfluxoRequestModel, PayfluxoRequestsTypesEnum } from '../../payment/models/PayfluxoRequestModel';
import { UserIdentification } from '../../payment/models/UserIdentification';
import { ProtocolEnum, ProtocolStateEnum } from '../../payment/rules/ProtocolStates';
import { establishConnection } from '../../payment/utils/ConnectionEstablisher';
import { isIntentionValid } from '../../payment/utils/IntentionIsValid';
import { validateIp } from '../../payment/utils/IpValidator';
import { getPeerHash } from '../../payment/utils/peerHash';
import { DownloadDeclarationIntentionStatusEnum } from '../../torrente/notification/NotificationHandler';
import { tryNatTraversal } from "../NatTraversalHandler";
import { NotificationHandler } from "../notification/NotificationHandler";
import { IAuthenticatedMessageData } from "./models/AuthenticatedMessage";
import { IDownloadedBlockMessageData } from "./models/DownloadedBlockMessage";
import { IDownloadIntentionMessageData } from './models/DownloadIntentionMessage';
import { MessagesHandlersMap } from './models/MessagesHandlersMap';

export class MessagesHandler {
    private static instance: MessagesHandler;
    private handlersMap: MessagesHandlersMap

    public static getInstance = (): MessagesHandler => {
        if (!MessagesHandler.instance) {
            throw Error("MessagesHandler not initialized yet");
        }
        return MessagesHandler.instance;
    }

    constructor(handlersMap: MessagesHandlersMap) {
        this.handlersMap = handlersMap;
        MessagesHandler.instance = this;
    }

    public handleMessage = (message: string) => {
        const messageObject = JSON.parse(message);
        this.handlersMap[messageObject['type']](messageObject['data']);
    }
}
