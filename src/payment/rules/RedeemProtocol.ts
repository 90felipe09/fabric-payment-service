import { ReceiverHandler } from "../controllers/ReceiverHandler";
import { SessionController } from "../controllers/SessionController";
import { RedeemArguments } from "../models/PaymentServiceInterface";
import { Protocol } from "../models/Protocol";

export class RedeemProtocol implements Protocol{
    receiverListener: ReceiverHandler;

    public activate = async () => {
        const redeemArguments: RedeemArguments = {
            commitment: this.receiverListener.commitment,
            hashLink: this.receiverListener.lastHash,
            hashLinkIndex: this.receiverListener.lastHashIndex
        }
        const paymentService = SessionController.getInstance().paymentService;
        await paymentService.invokeRedeem(redeemArguments);
        this.receiverListener.updateRedeemableValues(
            redeemArguments.hashLink,
            redeemArguments.hashLinkIndex);
        // receiverListener.redeemTimer.stopTimer();
    }

    constructor(receiverListener: ReceiverHandler) {
        this.receiverListener = receiverListener;
    }
}
