import { SessionController } from "../../payment/controllers/SessionController";
import { PaymentHashMap, ReceiverHashMap } from "../../payment/models/HandlersHashMap";
import { PayfluxoConsole } from "../Console";

export class InfoPayerCommand {
    private static mountPayerTable = (payers: ReceiverHashMap, index: number) => {
        const payerData = Object.values(payers)[index];
        const table = [
            { data: 'Download Intention ID', value: payerData.commitment.data.payment_intention_id },
            { data: 'Payer Certificate', value: payerData.loadedPayerPublicKey },
            { data: 'Magnetic Link', value: payerData.commitment.data.data_id },
            { data: 'Payer IP', value: payerData.payerIp },
            { data: 'Last Hash Index', value: payerData.lastHashIndex },
            { data: 'Last Hash Redeemed', value: payerData.lastHashRedeemedIndex }
        ]
        return table;
    }


    public static activate = async (index: number) => {
        const pConsole = PayfluxoConsole.getInstance();
        const pController = SessionController.getInstance();
        const payerTable = InfoPayerCommand.mountPayerTable(pController.receivingListeners, index);
        pConsole.table(payerTable);
    }
}
