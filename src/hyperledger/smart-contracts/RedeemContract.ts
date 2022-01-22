import { Contract } from "fabric-network";
import { CommitmentMessage } from "../../p2p/models/CommitmentMessage";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { REDEEM_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract";

export class RedeemContract extends SmartContract {
    chaincodeReference: Contract;

    public constructor(credentials: IAuthenticatedMessageData) {
        super(credentials, REDEEM_CONTRACT);
    }

    public invokeRedeem = async(commitment: CommitmentMessage, hashLink: string, hashLinkIndex: number): Promise<void> => {
        const stringfiedCommitment: string = JSON.stringify(commitment);
        this.invokeTransaction('redeem', [stringfiedCommitment, hashLink, hashLinkIndex]);
    }
}