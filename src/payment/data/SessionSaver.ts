import { AES } from "crypto-js";
import sha256 from 'crypto-js/sha256';
import fs from 'fs';
import { PaymentHandler } from "../controllers/PaymentHandler";
import { ReceiverHandler } from "../controllers/ReceiverHandler";
import { SessionController } from "../controllers/SessionController";
import { PayerHandlerData, ReceiverHandlerData, SessionData } from "./SessionData";

export class SessionSaver{
    private static convertSessionObject = (session: SessionController): SessionData =>{
        const paymentHandlers = [];
        const receiverHandlers = [];

        Object.values(session.paymentHandlers).map((paymentHandler: PaymentHandler) => {
            const [ lastHashSent, lastHashSentIndex ] = paymentHandler.retryLastPayment();
            const newPaymentHandler: PayerHandlerData = {
                commitment: paymentHandler.commitment.commitmentMessage,
                hashChain: paymentHandler.hashChain.hashes,
                ip: paymentHandler.receiverIp,
                lastHashSent: lastHashSent,
                lastHashSentIndex: lastHashSentIndex,
                magneticLink: paymentHandler.commitment.commitmentMessage.data.data_id
            }

            paymentHandlers.push(newPaymentHandler);
        })

        Object.values(session.receivingListeners).map((receiverHandler: ReceiverHandler) => {
            const newPaymentHandler: ReceiverHandlerData = {
                commitment: receiverHandler.commitment,
                ip: receiverHandler.payerIp,
                lastHashReceived: receiverHandler.lastHash,
                lastHashReceivedIndex: receiverHandler.lastHashIndex,
                lastHashRedeemed: receiverHandler.lastHashRedeemed,
                lastHashRedeemedIndex: receiverHandler.lastHashRedeemedIndex,
                publicCertificate: receiverHandler.loadedPayerPublicKey
            }

            receiverHandlers.push(newPaymentHandler);
        })

        return {
            payerHandlers: paymentHandlers,
            receiverHandlers: receiverHandlers,
            downloadDeclarations: session.downloadDeclarationIntentions
        }
    }

    public static saveSession(session: SessionController){
        const certificate = session.loadedUserCertificate;
        const sessionToSave = `${sha256(certificate)}.pay`;

        const privateKey = session.loadedUserKey;
        const keyToEncrypt = sha256(privateKey).toString();

        const sessionData = SessionSaver.convertSessionObject(session);

        const contentToCypher = JSON.stringify(sessionData);

        const cypheredData = AES.encrypt(contentToCypher, keyToEncrypt).toString();

        fs.writeFileSync(sessionToSave, cypheredData,
            {
                encoding: "utf8",
                flag: "w"
            });
    }
}