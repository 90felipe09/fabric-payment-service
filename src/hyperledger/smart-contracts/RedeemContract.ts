import { Contract } from "fabric-network";
import { CommitmentContent, CommitmentMessage } from "../../payment/models/Commitment";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { REDEEM_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract"; 

export class RedeemContract extends SmartContract {
    chaincodeReference: Contract;

    public constructor(credentials: IAuthenticatedMessageData) {
        super(credentials, REDEEM_CONTRACT);
    }

    public invokeRedeem = (commitment: CommitmentMessage, hashLink: string, hashLinkIndex: number) => {
        this.invokeTransaction('redeem', [commitment, hashLink, hashLinkIndex]);
    }
}