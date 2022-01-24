import { IClosingMessageData } from "../../torrente/messages/models/ClosingMessage";
import { SessionController } from "../controllers/SessionController";
import { SessionSaver } from "../data/SessionSaver";

export const handleClosing = (_data: IClosingMessageData) => {
    const sessionController = SessionController.getInstance();
    if (sessionController) {
        SessionSaver.saveSession(sessionController);
        sessionController.closeServer();
    }

    process.exit();
}