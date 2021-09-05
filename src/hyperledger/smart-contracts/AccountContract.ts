import { Contract } from "fabric-network";
import { AccountType } from "../../payment/models/PaymentServiceInterface";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { ACCOUNT_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract";


export class AccountContract extends SmartContract {
    chaincodeReference: Contract;

    public constructor(credentials: IAuthenticatedMessageData) {
        super(credentials, ACCOUNT_CONTRACT);
    }

    public evaluateAccount = async(accountId: string): Promise<AccountType> => {
        return await this.evaluateTransaction('readAccount', [accountId]);
    }
}