import { assert } from "console";
import { IAuthenticatedMessageData } from "../messages/models/AuthenticatedMessage";
import { IClosingMessageData } from "../messages/models/ClosingMessage";
import { IDownloadedBlockMessageData } from "../messages/models/DownloadedBlockMessage";
import { IDownloadIntentionMessageData } from "../messages/models/DownloadIntentionMessage";
import { ILogoutMessageData } from "../messages/models/LogoutMessage";
import { MessagesHandlersMap } from "../messages/models/MessagesHandlersMap";
import { IRedeemValuesMessageData } from "../messages/models/RedeemValuesMessage";
import { IRefreshWalletMessageData } from "../messages/models/RefreshWalletMessage";

const authenticationHandlerMock = (data: IAuthenticatedMessageData) => {
    assert(typeof(data.certificate) === 'string');
    assert(typeof(data.mspId) === 'string');
    assert(typeof(data.privateKey) === 'string')
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
    Authenticated: authenticationHandlerMock,
    Closing: closingHandlerMock,
    DownloadIntention: downloadIntentionHandlerMock,
    DownloadedBlock: downloadBlockHandlerMock,
    Logout: logoutHandlerMock,
    RedeemValues: redeemValuesHandlerMock,
    RefreshWallet: refreshWalletHandlerMock
}
