import { PayfluxoConsole } from "../../console/Console";
import { ReceiverHandler } from "../controllers/ReceiverHandler";

const MINS_TO_REDEEM = 5;
const SECONDS_IN_MINUTE = 60;
const MIL_IN_SECONDS = 1000;

export class RedeemTimer {
    private timer: number;
    private intervalObject: NodeJS.Timeout;
    private receiverHandlerReference: ReceiverHandler;
    private redeemRoutine: (receiverListener: ReceiverHandler) => Promise<void>;

    public constructor(receiverHandler: ReceiverHandler, redeemRoutine: (receiverListener: ReceiverHandler) => Promise<void>) {
        this.timer = 0;
        this.receiverHandlerReference = receiverHandler;
        this.redeemRoutine = redeemRoutine;
    }

    public resetTimer = () => {
        this.timer = MINS_TO_REDEEM;
        const console = PayfluxoConsole.getInstance();
        this.intervalObject = setInterval(async () => {
            this.timer -= 1;
            if (this.timer <= 0){
                try{
                    await this.redeemRoutine(this.receiverHandlerReference);
                    console.debug (`Automatic redeem succeded`);
                    this.stopTimer();
                }
                catch(e){
                    console.error (`Couldn't redeem automatically: ${e}`);
                    this.stopTimer();
                }
            }
        }, SECONDS_IN_MINUTE * MIL_IN_SECONDS);
    }

    public stopTimer = () => {
        this.resetTimer();
        clearInterval(this.intervalObject);
    }
}