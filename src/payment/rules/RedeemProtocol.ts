import { PayfluxoConsole } from "../../console/Console";
import { ReceiverHandler } from "../controllers/ReceiverHandler";
import { SessionController } from "../controllers/SessionController";
import { RedeemArguments } from "../models/PaymentServiceInterface";
import { Protocol } from "../models/Protocol";

export class RedeemProtocol implements Protocol{
    receiverListener: ReceiverHandler;

    public activate = async () => {
        const console = PayfluxoConsole.getInstance();
        const redeemArguments: RedeemArguments = {
            commitment: this.receiverListener.commitment,
            hashLink: this.receiverListener.lastHash,
            hashLinkIndex: this.receiverListener.lastHashIndex
        }
        const paymentService = SessionController.getInstance().paymentService;
        try{
            await paymentService.invokeRedeem(redeemArguments);
        }
        catch{
            console.log(`Tokens already redeemed for ${redeemArguments.commitment.commitment_hash}`)
        }
        this.receiverListener.updateRedeemableValues(
            redeemArguments.hashLink,
            redeemArguments.hashLinkIndex);
        // receiverListener.redeemTimer.stopTimer();
    }

    constructor(receiverListener: ReceiverHandler) {
        this.receiverListener = receiverListener;
    }
}
