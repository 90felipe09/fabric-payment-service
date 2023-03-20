import { PayfluxoConsole } from "../../console/Console";
import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { IAuthenticationMessageData } from "../../torrente/messages/models/AuthenticationMessage";
import { NotificationHandler } from "../../torrente/notification/NotificationHandler";
import { SessionController } from "../controllers/SessionController";
import { SessionLoader } from "../data/SessionLoader";
import { UserIdentification } from "../models/UserIdentification";
import { decrypt, generateKey } from "../utils/Encryption";

type CredentialsBranch = {
    certificate: string;
    privateKey: string;
}

type DecryptedCredentials = {
    credentials: CredentialsBranch;
    mspId: string;
    type: string,
    version: number
}

export const handleAuthentication = (data: IAuthenticationMessageData) => {
    const key = generateKey(data.password, data.salt);
    const decryptedContent = decrypt(key, data.encrypted_content);
    try{
        const decryptedObject: DecryptedCredentials = JSON.parse(decryptedContent);
        const authObject: UserIdentification = {
            certificate: decryptedObject.credentials.certificate,
            orgMSPID: decryptedObject.mspId,
            privateKey: decryptedObject.credentials.privateKey
        }
        new PayfluxoServer();
        new SessionController(authObject);
        const sessionController = SessionController.getInstance();
        const notificationHandler = NotificationHandler.getInstance();
    
        notificationHandler.notifyAuthentication(
            decryptedObject.credentials.certificate, decryptedObject.mspId)
    
        SessionLoader.LoadSession(sessionController)
        const console = PayfluxoConsole.getInstance();
        console.enableCommands();
    }
    catch(e){
        const notificationHandler = NotificationHandler.getInstance();
    
        notificationHandler.notifyAuthenticationFailed()
    }
}
