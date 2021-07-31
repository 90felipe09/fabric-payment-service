import { Contract } from "fabric-network";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { ACCOUNT_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract";

type AccountType = {
    id: string,
    address: string,
    name: string,
    tokens: string[],
    balance: string,
    public_key: string,
    created_at: string
}

export class AccountContract extends SmartContract {
    chaincodeReference: Contract;

    public constructor(credentials: IAuthenticatedMessageData) {
        super(credentials, ACCOUNT_CONTRACT);
    }

    public evaluateAccount = async(accountId: string): Promise<AccountType> => {
        return this.evaluateTransaction('readAccount', [accountId]);
    }
}