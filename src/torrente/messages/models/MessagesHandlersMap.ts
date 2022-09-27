import { IAuthenticationMessageData } from "./AuthenticationMessage";
import { IClosingMessageData } from "./ClosingMessage";
import { IDownloadedBlockMessageData } from "./DownloadedBlockMessage";
import { IDownloadIntentionMessageData } from "./DownloadIntentionMessage";
import { ILogoutMessageData } from "./LogoutMessage";
import { IRedeemValuesMessageData } from "./RedeemValuesMessage";
import { IRefreshWalletMessageData } from "./RefreshWalletMessage";

export type MessagesHandlersMap = {
    DownloadedBlock: (data: IDownloadedBlockMessageData) => void;
    Authentication: (data: IAuthenticationMessageData) => void;
    Logout: (data: ILogoutMessageData) => void;
    Closing: (data: IClosingMessageData) => void;
    DownloadIntention: (data: IDownloadIntentionMessageData) => void;
    RedeemValues: (data: IRedeemValuesMessageData) => void;
    RefreshWallet: (data: IRefreshWalletMessageData) => void;
}
