import axios from "axios";
import { AccountType, CreatePaymentIntentionArguments, PaymentIntentionResponse, PaymentServiceInterface, RedeemArguments } from "../payment/models/PaymentServiceInterface";
import { getAddress } from "../payment/utils/userAddress";
import { IAuthenticatedMessageData } from "../torrente/messages/models/AuthenticatedMessage";
import { PLANOC_ENDPOINT } from "./config";
import { RequestSigner } from "./RequestSigner";

export class PlanocPaymentService implements PaymentServiceInterface {
    authData: IAuthenticatedMessageData;

    public init = async (authData: IAuthenticatedMessageData): Promise<void> => {
        this.authData = authData;
    }

    public evaluateAccount = async (accountId: string): Promise<AccountType> => {
        const accountEndpoint = `${PLANOC_ENDPOINT}/user?id=${accountId}`;
        const response = await axios.get(accountEndpoint);
        const account: AccountType = response.data;
        return account;
    }

    public invokeCreatePaymentIntention = async (createPaymentIntentionArgs: CreatePaymentIntentionArguments): Promise<PaymentIntentionResponse> => {
        const declarationEndpoint = `${PLANOC_ENDPOINT}/declaration`
        const fingerprint = getAddress(this.authData.certificate);
        const planocArgs = {
            magnetic_link: createPaymentIntentionArgs.magneticLink,
            value_to_freeze: createPaymentIntentionArgs.valueToFreeze,
            fingerprint: fingerprint
        }
        const signedRequest = RequestSigner.signRequest(planocArgs, this.authData.privateKey, this.authData.certificate);
        const response = await axios.post(declarationEndpoint, signedRequest);
        const paymentIntention: PaymentIntentionResponse = response.data;
        return paymentIntention;
    }

    public invokeReadPaymentIntention = async (downloadIntentionId: string): Promise<PaymentIntentionResponse> => {
        const declarationEndpoint = `${PLANOC_ENDPOINT}/declaration?id=${downloadIntentionId}`;
        const response = await axios.get(declarationEndpoint);
        const declaration: PaymentIntentionResponse = response.data;
        return declaration;
    }

    public queryGetPiecePrice = async (): Promise<number> => {
        const piecePriceEndpoint = `${PLANOC_ENDPOINT}/block-price`
        const response = await axios.get(piecePriceEndpoint);
        const blockPrice: number = response.data['block_price']
        return blockPrice;
    }

    public invokeRedeem = async (redeemArguments: RedeemArguments): Promise<void> => {
        const redeemEndpoint = `${PLANOC_ENDPOINT}/redeem`
        const signedRequest = RequestSigner.signRequest(redeemArguments, this.authData.privateKey, this.authData.certificate);
        await axios.post(redeemEndpoint, signedRequest);
    }
}