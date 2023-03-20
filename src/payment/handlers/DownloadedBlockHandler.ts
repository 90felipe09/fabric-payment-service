import { PayfluxoConsole } from "../../console/Console";
import { getPeerHash } from "../../p2p/util/peerHash";
import { IDownloadedBlockMessageData } from "../../torrente/messages/models/DownloadedBlockMessage";
import { SessionController } from "../controllers/SessionController";
import { CommitmentRegisterProtocol } from "../rules/CommitmentRegisterProtocol";


// Sends a message to payfluxo notifying that downloaded a new block
export const handleDownloadedBlock = async (data: IDownloadedBlockMessageData) => {
    const sessionController = SessionController.getInstance()
    const uploaderHash = getPeerHash(data.uploaderIp, data.magneticLink);
    
    if (Object.keys(sessionController.paymentHandlers).includes(uploaderHash)){
        const paymentHandler = sessionController.paymentHandlers[uploaderHash]
        if (paymentHandler.validated){
            paymentHandler.paymentProtocol.activate();
        }
        else {
            const console = PayfluxoConsole.getInstance();
            console.debug("Payment channel establishment protocol in process");
            paymentHandler.payHash();
        }
    }
    // Verifies that it's the first time that a block is received from that IP for that magnetic link.
    else {
        const commitmentProtocol = new CommitmentRegisterProtocol(data);
        commitmentProtocol.activate();
    }
}
