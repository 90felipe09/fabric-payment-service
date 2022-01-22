import { ILogoutMessageData } from "../../torrente/messages/models/LogoutMessage";
import { SessionController } from "../controllers/SessionController";
import { SessionSaver } from "../data/SessionSaver";

export const handleLogout = (_data?: ILogoutMessageData) => {
    const sessionController = SessionController.getInstance();
    SessionSaver.saveSession(sessionController);
    sessionController.closeServer();
}
