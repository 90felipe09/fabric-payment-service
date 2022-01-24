import { IRedeemValuesMessageData } from "../../torrente/messages/models/RedeemValuesMessage";
import { SessionController } from "../controllers/SessionController";
import { RedeemProtocol } from "../rules/RedeemProtocol";
import { handleRefreshWallet } from "./RefreshWalletHandler";

export const handleRedeemValues = async (_data?: IRedeemValuesMessageData) => {
    const sessionController = SessionController.getInstance()
    const redeemPromises = Object.values(sessionController.receivingListeners).map(async(receiverListener) => {
        try{
            const redeemProtocol = new RedeemProtocol(receiverListener);
            await redeemProtocol.activate();
        }
        catch{
            console.log(`[ERROR] Couldn't redeem values for receiverlistener ${receiverListener.commitment.commitment_hash}`);
        }
    });
    await Promise.all(redeemPromises);

    handleRefreshWallet();
}
