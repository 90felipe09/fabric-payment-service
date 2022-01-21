import { AccountType, CreatePaymentIntentionArguments, PaymentIntentionResponse, PaymentServiceInterface, RedeemArguments } from "../payment/models/PaymentServiceInterface";
import { IAuthenticatedMessageData } from "../torrente/messages/models/AuthenticatedMessage";
import { AccountContract } from "./smart-contracts/AccountContract";
import { PaymentIntentionContract } from "./smart-contracts/PaymentIntentionContract";
import { RedeemContract } from "./smart-contracts/RedeemContract";

export class HyperledgerPaymentService implements PaymentServiceInterface {
    redeemContract: RedeemContract;
    paymentIntentionContract: PaymentIntentionContract;
    accountContract: AccountContract;

    public init = async (authData: IAuthenticatedMessageData): Promise<void> => {
        this.redeemContract = new RedeemContract(authData);
        this.paymentIntentionContract = new PaymentIntentionContract(authData);
        this.accountContract = new AccountContract(authData);

        await this.redeemContract.init();
        await this.paymentIntentionContract.init();
        await this.accountContract.init();
    }

    public evaluateAccount = async (accountId: string): Promise<AccountType> => {
        return this.accountContract.evaluateAccount(accountId);
    }

    public invokeCreatePaymentIntention = async (createPaymentIntention: CreatePaymentIntentionArguments): Promise<PaymentIntentionResponse> => {
        return this.paymentIntentionContract.invokeCreatePaymentIntention(
            createPaymentIntention.magneticLink,
            createPaymentIntention.valueToFreeze
            );
    }

    public invokeReadPaymentIntention = async (downloadIntentionId: string): Promise<PaymentIntentionResponse> => {
        return this.paymentIntentionContract.invokeReadPaymentIntention(downloadIntentionId);
    }

    public queryGetPiecePrice = async (): Promise<number> => {
        return this.paymentIntentionContract.queryGetPiecePrice();
    }

    public invokeRedeem = async (redeemArguments: RedeemArguments): Promise<void> => {
        await this.redeemContract.invokeRedeem(
            redeemArguments.commitment,
            redeemArguments.hashLink,
            redeemArguments.hashLinkIndex
        )
    }
}