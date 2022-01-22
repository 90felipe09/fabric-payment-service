import { SessionController } from "../controllers/SessionController";

export const isIntentionValid = async (intentionId: string): Promise<boolean> => {
    if (intentionId) {
        const sessionController = SessionController.getInstance();
        const declarationReference = await sessionController.paymentService.invokeReadPaymentIntention(intentionId);
        const isNotExpired = new Date(Date.parse(declarationReference.expiration_date)) > new Date();
        return isNotExpired;
    }
    return false;
}