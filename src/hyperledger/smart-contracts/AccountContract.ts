import { Contract } from "fabric-network";
import { AccountType } from "../../payment/models/PaymentServiceInterface";
import { UserIdentification } from "../../payment/models/UserIdentification";
import { ACCOUNT_CONTRACT } from "../config";
import { SmartContract } from "./SmartContract";


export class AccountContract extends SmartContract {
    chaincodeReference: Contract;

    public constructor(credentials: UserIdentification) {
        super(credentials, ACCOUNT_CONTRACT);
    }

    public evaluateAccount = async(accountId: string): Promise<AccountType> => {
        return await this.evaluateTransaction('readAccount', [accountId]);
    }
}