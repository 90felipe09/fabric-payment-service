import { IRefreshWalletMessageData } from "../../torrente/messages/models/RefreshWalletMessage";
import { NotificationHandler } from "../../torrente/notification/NotificationHandler";
import { getWallet } from "../commands/GetWallet";


export const handleRefreshWallet = async (_data?: IRefreshWalletMessageData) => {
    try{
        const accountWallet = await getWallet();

        const notificationHandler = NotificationHandler.getInstance();
        notificationHandler.notifyWalletRefresh(accountWallet);
    }
    catch(e){
        console.log(`[ERROR] Couldn't fetch wallet state: ${e}`);
    }
}
