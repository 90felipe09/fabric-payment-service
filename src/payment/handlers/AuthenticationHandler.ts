import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { SessionController } from "../controllers/SessionController";
import { SessionLoader } from "../data/SessionLoader";
import { UserIdentification } from "../models/UserIdentification";

export const handleAuthentication = (data: IAuthenticatedMessageData) => {
    const authObject: UserIdentification = {
        certificate: data.certificate,
        orgMSPID: data.mspId,
        privateKey: data.privateKey
    }
    new PayfluxoServer();
    new SessionController(authObject);
    const sessionController = SessionController.getInstance();

    SessionLoader.LoadSession(sessionController)
}
