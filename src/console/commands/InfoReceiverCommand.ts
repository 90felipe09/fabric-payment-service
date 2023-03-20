import { SessionController } from "../../payment/controllers/SessionController";
import { PaymentHashMap } from "../../payment/models/HandlersHashMap";
import { PayfluxoConsole } from "../Console";

export class InfoReceiverCommand {
    private static mountReceiverTable = (receivers: PaymentHashMap, index: number) => {
        const receiverData = Object.values(receivers)[index];
        const hashesPaidString = `${receiverData.hashChain.hashes.length - receiverData.hashChain.hashToPay}/${receiverData.hashChain.hashes.length}`
        const table = [
            { data: 'Download Intention ID', value: receiverData.downloadIntentionId },
            { data: 'Receiver Certificate', value: receiverData.receiverCertificate },
            { data: 'Magnetic Link', value: receiverData.magneticLink },
            { data: "Receiver IP", value: receiverData.receiverIp },
            { data: 'Hashes paid', value: hashesPaidString },
            { data: 'Commitment ID', value: receiverData.commitment.commitmentMessage.data.data_id },
            { data: 'Hash Root', value: receiverData.commitment.commitmentMessage.data.hash_root }
        ]
        return table;
    }


    public static activate = async (index: number) => {
        const pConsole = PayfluxoConsole.getInstance();
        const pController = SessionController.getInstance();
        const payerTable = InfoReceiverCommand.mountReceiverTable(pController.paymentHandlers, index);
        pConsole.table(payerTable);
    }
}
