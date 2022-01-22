import { IDownloadIntentionMessageData } from "../../torrente/messages/models/DownloadIntentionMessage";
import { DownloadDeclarationIntentionProtocol } from "../rules/DownloadDeclarationIntentionProtocol";

export const handleDownloadIntention = async (data: IDownloadIntentionMessageData) => {
    const downloadDeclarationProtocol = new DownloadDeclarationIntentionProtocol(data);
    downloadDeclarationProtocol.activate();
}
