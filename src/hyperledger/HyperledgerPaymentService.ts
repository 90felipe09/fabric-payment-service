import { AccountType, CreatePaymentIntentionArguments, PaymentIntentionResponse, PaymentServiceInterface, RedeemArguments } from "../payment/models/PaymentServiceInterface";
import { UserIdentification } from "../payment/models/UserIdentification";
import { HYPERLEDGER_COIN_DIVISOR } from "./config";
import { AccountContract } from "./smart-contracts/AccountContract";
import { PaymentIntentionContract } from "./smart-contracts/PaymentIntentionContract";
import { RedeemContract } from "./smart-contracts/RedeemContract";


export class HyperledgerPaymentService implements PaymentServiceInterface {
    redeemContract: RedeemContract;
    paymentIntentionContract: PaymentIntentionContract;
    accountContract: AccountContract;

    coinDivisor: number;
    isInitialized: boolean;

    initializedResolver: (value?: void) => void = () => {};

    private static instance: HyperledgerPaymentService;

    public static getInstance = (): HyperledgerPaymentService => {
        if (!HyperledgerPaymentService.instance){
            throw Error("Hyperledger payment service has not been initialized");
        }
        return HyperledgerPaymentService.instance;
    }

    public constructor() {
        HyperledgerPaymentService.instance = this;
        this.coinDivisor = HYPERLEDGER_COIN_DIVISOR;
        this.isInitialized = false;
    }

    public init = async (authData: UserIdentification): Promise<void> => {
        this.redeemContract = new RedeemContract(authData);
        this.paymentIntentionContract = new PaymentIntentionContract(authData);
        this.accountContract = new AccountContract(authData);

        await this.redeemContract.init();
        await this.paymentIntentionContract.init();
        await this.accountContract.init();

        this.isInitialized = true;

        this.initializedResolver();
    }

    public waitTillInitialized = async(): Promise<void> => {
        if (this.isInitialized){
            return new Promise((resolve, _reject) => {
                resolve(null);
            })
        }
        else{
            const initializationPromise = new Promise((resolve: (value: void) => void, _reject) => {
                this.initializedResolver = resolve;
            })
            return initializationPromise;
        }
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