import { assert } from "console";
import { IAuthenticationMessageData } from "../messages/models/AuthenticationMessage";
import { IClosingMessageData } from "../messages/models/ClosingMessage";
import { IDownloadedBlockMessageData } from "../messages/models/DownloadedBlockMessage";
import { IDownloadIntentionMessageData } from "../messages/models/DownloadIntentionMessage";
import { ILogoutMessageData } from "../messages/models/LogoutMessage";
import { MessagesHandlersMap } from "../messages/models/MessagesHandlersMap";
import { IRedeemValuesMessageData } from "../messages/models/RedeemValuesMessage";
import { IRefreshWalletMessageData } from "../messages/models/RefreshWalletMessage";

const authenticationHandlerMock = (data: IAuthenticationMessageData) => {
    assert(typeof(data.encrypted_content) === 'string');
    assert(typeof(data.password) === 'string');
    assert(typeof(data.salt) === 'string')
}

const closingHandlerMock = (data: IClosingMessageData) => {
    assert(typeof(data.message) === 'string')
}

const downloadIntentionHandlerMock = (data: IDownloadIntentionMessageData) => {
    assert(typeof(data.magneticLink) === 'string')
    assert(typeof(data.piecesNumber) === 'number')
    assert(typeof(data.torrentId) === 'string')
}

const downloadBlockHandlerMock = (data: IDownloadedBlockMessageData) => {
    assert(typeof(data.fileSize) === 'number')
    assert(typeof(data.magneticLink) === 'string')
    assert(typeof(data.uploaderIp) === 'string')
}

const logoutHandlerMock = (data: ILogoutMessageData) => {
    assert(typeof(data.message) === 'string')
}

const redeemValuesHandlerMock = (data: IRedeemValuesMessageData) => {
    assert(typeof(data.message) === 'string');
}

const refreshWalletHandlerMock = (data: IRefreshWalletMessageData) => {
    assert(typeof(data.message) === 'string')
}

export const messagesHandlerMock: MessagesHandlersMap = {
    Authentication: authenticationHandlerMock,
    Closing: closingHandlerMock,
    DownloadIntention: downloadIntentionHandlerMock,
    DownloadedBlock: downloadBlockHandlerMock,
    Logout: logoutHandlerMock,
    RedeemValues: redeemValuesHandlerMock,
    RefreshWallet: refreshWalletHandlerMock
}
