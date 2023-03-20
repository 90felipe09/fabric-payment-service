import { SessionController } from "../../payment/controllers/SessionController";
import { ReceiverHashMap } from "../../payment/models/HandlersHashMap";
import { PayfluxoConsole } from "../Console";

export class ListPayersCommand {
    private static mountPayersTable = (payers: ReceiverHashMap) => {
        const table = Object.keys(payers).map(payerHash => {
            const payerData = payers[payerHash];
            return {
                ip: payerData.payerIp,
                lastHash: payerData.lastHash,
                lastHashIndex: payerData.lastHashIndex
            }
        })
        return table;
    }


    public static activate = async () => {
        const pConsole = PayfluxoConsole.getInstance();
        const pController = SessionController.getInstance();
        const payersTable = ListPayersCommand.mountPayersTable(pController.receivingListeners);
        pConsole.table(payersTable);
    }
}
