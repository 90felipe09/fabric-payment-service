import { CommitmentMessage } from "./CommitmentMessage";


export interface PayfluxoInterface {
    requestCertificate: () => void;
    respondCertificate: () => void;
    sendPayment: (hashLinkToPay: string, hashLinkIndex: number, magneticLink: string) => void;
    acceptPayment: () => void;
    rejectPayment: () => void;
    proposeCommitment: (commitment: CommitmentMessage) => void;
    acceptCommitment: () => void;
    rejectCommitment: () => void;
}
