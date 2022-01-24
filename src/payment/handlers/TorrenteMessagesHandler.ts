import { MessagesHandlersMap } from "../../torrente/messages/models/MessagesHandlersMap";
import { handleAuthentication } from "./AuthenticationHandler";
import { handleClosing } from "./ClosingHandler";
import { handleDownloadedBlock } from "./DownloadedBlockHandler";
import { handleDownloadIntention } from "./DownloadIntentionHandler";
import { handleLogout } from "./LogoutHandler";
import { handleRedeemValues } from "./RedeemValuesHandler";
import { handleRefreshWallet } from "./RefreshWalletHandler";

export const payfluxoMessagesHandler: MessagesHandlersMap = {
    Authenticated: handleAuthentication,
    Closing: handleClosing,
    DownloadIntention: handleDownloadIntention,
    DownloadedBlock: handleDownloadedBlock,
    Logout: handleLogout,
    RedeemValues: handleRedeemValues,
    RefreshWallet: handleRefreshWallet
}
