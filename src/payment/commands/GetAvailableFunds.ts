import { SessionController } from "../controllers/SessionController";
import { getAddress } from "../utils/userAddress";

export const getAvailableFunds = async (): Promise<number> => {
    const sessionController = SessionController.getInstance();
    const accountId: string = getAddress(sessionController.loadedUserCertificate);
    const account = await sessionController.paymentService.evaluateAccount(accountId);
    const coinDivisor = sessionController.paymentService.coinDivisor;
    const availableFunds: number = parseFloat(account.balance) / coinDivisor;
    const escrowTokens = account.tokens;
    return availableFunds;
}
