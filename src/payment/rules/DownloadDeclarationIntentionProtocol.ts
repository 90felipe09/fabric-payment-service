import { PayfluxoConsole } from "../../console/Console";
import { IDownloadIntentionMessageData } from "../../torrente/messages/models/DownloadIntentionMessage";
import { DownloadDeclarationIntentionStatusEnum, NotificationHandler } from "../../torrente/notification/NotificationHandler";
import { SessionController } from "../controllers/SessionController";
import { CreatePaymentIntentionArguments } from "../models/PaymentServiceInterface";
import { Protocol } from "../models/Protocol";

export class DownloadDeclarationIntentionProtocol implements Protocol{
    downloadData: IDownloadIntentionMessageData;

    public activate = async () => {
        const console = PayfluxoConsole.getInstance();
        console.log('Initiating Download Intention Declaration protocol.')
        const sessionController = SessionController.getInstance();
        let declarationId = sessionController.downloadDeclarationIntentions[this.downloadData.magneticLink];
        const isValid = await this.isIntentionValid(declarationId);
        if (isValid){
            console.warn("Already declared an intention download for this file. Ignoring request.")
            this.notifySuccessfulOperation();
        }
        else {
            try{
                await this.declareNewPaymentIntention();
                this.notifySuccessfulOperation();
            }
            catch {
                this.notifyFailingOperation();
            }
        }
    };

    private notifySuccessfulOperation = () => {
        const console = PayfluxoConsole.getInstance();
        console.sucess("Succesfully declared a download intention");
        const notificationHandler = NotificationHandler.getInstance();
        notificationHandler.notifyDownloadDeclarationIntentionStatus(
            this.downloadData.torrentId,
            DownloadDeclarationIntentionStatusEnum.SUCCESS);
    }

    private notifyFailingOperation = () => {
        const console = PayfluxoConsole.getInstance();
        console.error("Download intention declaration failed. No funds.");
        const notificationHandler = NotificationHandler.getInstance();
        notificationHandler.notifyDownloadDeclarationIntentionStatus(
            this.downloadData.torrentId,
            DownloadDeclarationIntentionStatusEnum.NO_FUNDS);
    }

    private declareNewPaymentIntention = async () => {
        const sessionController = SessionController.getInstance();
        const piecePrice = await sessionController.paymentService.queryGetPiecePrice();
        const paymentIntentionArgs: CreatePaymentIntentionArguments = {
            magneticLink: this.downloadData.magneticLink,
            valueToFreeze: this.downloadData.piecesNumber * piecePrice
        }
        const paymentIntention = await sessionController.paymentService.invokeCreatePaymentIntention(paymentIntentionArgs);
        if (paymentIntention.id) {
            sessionController.downloadDeclarationIntentions[this.downloadData.magneticLink] = paymentIntention.id;
        }
    }

    private isIntentionValid = async (intentionId: string): Promise<boolean> => {
        if (intentionId) {
            const sessionController = SessionController.getInstance();
            const declarationReference = await sessionController.paymentService.invokeReadPaymentIntention(intentionId);
            const expirationDateTimestamp = Date.parse(declarationReference.expiration_date)
            const isNotExpired = new Date(expirationDateTimestamp) > new Date();
            return isNotExpired;
        }
        return false;
    }

    constructor(data: IDownloadIntentionMessageData){
        this.downloadData = data;
    }
}