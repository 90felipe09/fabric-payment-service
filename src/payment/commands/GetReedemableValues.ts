import { PayfluxoConsole } from "../../console/Console";
import { SessionController } from "../controllers/SessionController";

export const getReedemableValues = async (): Promise<number> => {
    const sessionController = SessionController.getInstance();
    try{
        const reedemableHashesNumber: number = Object.values(sessionController.receivingListeners).reduce((acc, receiverListener) => {
            acc += (receiverListener.lastHashIndex - receiverListener.lastHashRedeemedIndex);
            return acc;
        }, 0);
        const piecePrice = await sessionController.paymentService.queryGetPiecePrice();
        const coinDivisor = sessionController.paymentService.coinDivisor;
        return reedemableHashesNumber * piecePrice / coinDivisor;
    }
    catch (e){
        const console = PayfluxoConsole.getInstance();
        console.error(e)
        throw (Error("[ERROR] Couldn't fetch piece price."))
    }
}