import { PayfluxoServer } from "../../p2p/connections/PayfluxoServer";
import { IAuthenticationMessageData } from "../../torrente/messages/models/AuthenticationMessage";
import { NotificationHandler } from "../../torrente/notification/NotificationHandler";
import { SessionController } from "../controllers/SessionController";
import { SessionLoader } from "../data/SessionLoader";
import { UserIdentification } from "../models/UserIdentification";
import { decrypt, generateKey } from "../utils/Encryption";

type DecryptedCredentials = {
    certificate: string;
    orgMSPID: string;
    privateKey: string
}

export const handleAuthentication = (data: IAuthenticationMessageData) => {
    const key = generateKey(data.password, data.salt);
    const decryptedContent = decrypt(key, data.encrypted_content);
    try{
        const decryptedObject: DecryptedCredentials = JSON.parse(decryptedContent);
        const authObject: UserIdentification = {
            certificate: decryptedObject.certificate,
            orgMSPID: decryptedObject.orgMSPID,
            privateKey: decryptedObject.privateKey
        }
        new PayfluxoServer();
        new SessionController(authObject);
        const sessionController = SessionController.getInstance();
        const notificationHandler = NotificationHandler.getInstance();
    
        notificationHandler.notifyAuthentication(
            decryptedObject.certificate, decryptedObject.orgMSPID)
    
        SessionLoader.LoadSession(sessionController)
    }
    catch(e){
        const notificationHandler = NotificationHandler.getInstance();
    
        notificationHandler.notifyAuthenticationFailed()
    }
}
