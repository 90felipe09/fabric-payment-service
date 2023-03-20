import { SessionController } from "../../payment/controllers/SessionController";
import { PaymentHashMap } from "../../payment/models/HandlersHashMap";
import { PayfluxoConsole } from "../Console";

export class ListReceiverCommand {
    private static mountReceiversTable = (receivers: PaymentHashMap) => {
        const table = Object.keys(receivers).map(receiverHash => {
            const receiverData = receivers[receiverHash];
            const hashesPaidString = `${receiverData.hashChain.hashes.length - receiverData.hashChain.hashToPay}/${receiverData.hashChain.hashes.length}`
            return {
                ip: receiverData.receiverIp,
                hashesPaid: hashesPaidString,
                validated: receiverData.validated
            }
        })
        return table;
    }


    public static activate = async () => {
        const pConsole = PayfluxoConsole.getInstance();
        const pController = SessionController.getInstance();
        const payersTable = ListReceiverCommand.mountReceiversTable(pController.paymentHandlers);
        pConsole.table(payersTable);
    }
}
