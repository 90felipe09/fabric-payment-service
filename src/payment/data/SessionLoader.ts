import { AES, enc } from "crypto-js";
import sha256 from 'crypto-js/sha256';
import fs from 'fs';
import { SessionController } from "../controllers/SessionController";
import { PayerHandlerData, ReceiverHandlerData, SessionData } from "./SessionData";

export class SessionLoader {
    public static LoadSession(sessionController: SessionController){
        const certificate = sessionController.loadedUserCertificate;
        const privateKey = sessionController.loadedUserKey
        
        const sessionToRecover = `${sha256(certificate)}.pay`;
        fs.readFile(sessionToRecover, 'utf8', function (err,data) {
            if (err) {
              return console.log("[INFO] New user");
            }
            const keyToDecrypt = sha256(privateKey).toString();

            const decryptedData = AES.decrypt(data, keyToDecrypt).toString(enc.Utf8);

            const sessionData: SessionData = JSON.parse(decryptedData);

            console.log("[INFO] loaded session content:\n");
            console.log(sessionData);

            sessionData.payerHandlers.map((payerHandler: PayerHandlerData) => {
                sessionController.recoverPaymentHandler(
                    payerHandler.ip,
                    payerHandler.magneticLink,
                    payerHandler.lastHashSent,
                    payerHandler.lastHashSentIndex,
                    payerHandler.commitment,
                    payerHandler.hashChain
                )
            })

            sessionData.receiverHandlers.map((receiverHandler: ReceiverHandlerData) => {
                sessionController.recoverReceivingListener(
                    receiverHandler.ip,
                    receiverHandler.publicCertificate,
                    receiverHandler.commitment,
                    receiverHandler.lastHashReceived,
                    receiverHandler.lastHashReceivedIndex,
                    receiverHandler.lastHashRedeemed,
                    receiverHandler.lastHashRedeemedIndex
                );
            })

            sessionController.recoverDownloadIntentions(sessionData.downloadDeclarations);
          });
    }
}