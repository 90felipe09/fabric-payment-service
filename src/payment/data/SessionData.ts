import { CommitmentMessage } from "../../p2p/models/CommitmentMessage"
import { DownloadDeclarationIntentionsMap } from "../controllers/SessionController"

export type ReceiverHandlerData = {
    commitment: CommitmentMessage,
    ip: string,
    publicCertificate: string,
    lastHashReceived: string,
    lastHashReceivedIndex: number,
    lastHashRedeemed: string,
    lastHashRedeemedIndex: number
}

export type PayerHandlerData = {
    hashChain: string[],
    commitment: CommitmentMessage;
    lastHashSent: string,
    lastHashSentIndex: number,
    magneticLink: string,
    ip: string
}

export type SessionData = {
    receiverHandlers: ReceiverHandlerData[],
    payerHandlers: PayerHandlerData[],
    downloadDeclarations: DownloadDeclarationIntentionsMap
}
