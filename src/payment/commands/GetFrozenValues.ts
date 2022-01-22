import { SessionController } from "../controllers/SessionController";
import { PaymentIntentionResponse } from "../models/PaymentServiceInterface";


export const getFrozenValues = async (): Promise<number> => {
    const sessionController = SessionController.getInstance();
    try{
        const paymentIntentionsPromises: Promise<PaymentIntentionResponse>[] = Object.values(
            sessionController.downloadDeclarationIntentions).map(downloadIntentionId => {
                return sessionController.paymentService.invokeReadPaymentIntention(downloadIntentionId);
        })
        const paymentIntentions = await Promise.all(paymentIntentionsPromises);
        const frozenValues: number = paymentIntentions.reduce((acc, paymentIntention) => {
            acc += paymentIntention.available_funds;
            return acc;
        }, 0);
        const coinDivisor = sessionController.paymentService.coinDivisor;
        return frozenValues / coinDivisor;
    }
    catch {
        throw (Error("[ERROR] Couldn't fetch payment intentions."))
    }
}