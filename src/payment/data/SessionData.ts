import { DownloadDeclarationIntentionsMap } from "../controllers/SessionController"
import { CommitmentContent, CommitmentMessage } from "../models/Commitment"

export type ReceiverHandlerData = {
    commitment: CommitmentContent,
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