import crypto from 'crypto';
import sha256 from 'crypto-js/sha256';

const ALGORITHM = "sha384";
const SIGNATURE_FORMAT = "hex"

export type CommitmentMessage = {
    content: CommitmentContent,
    signature: string
}

export type CommitmentContent = {
    magneticLink: string
    payerFingerprint: string,
    receiverFingerprint: string,
    hashRoot: string,
    downloadIntentionId: string
}

export class Commitment {
    commitmentMessage: CommitmentMessage;

    public loadCommitment = (commitmentMessage: CommitmentMessage) => {
        this.commitmentMessage = commitmentMessage;
    }

    public initCommitment = (
        magneticLink: string, 
        receiverCertificate: string,
        hashRoot: string, 
        userPrivateKey: string,
        userCertificate: string,
        downloadIntentionId: string
    ) => {
        const sign = crypto.createSign(ALGORITHM);

        const commitmentContent = {
            magneticLink: magneticLink,
            payerFingerprint: sha256(userCertificate).toString(),
            receiverFingerprint: sha256(receiverCertificate).toString(),
            hashRoot: hashRoot,
            downloadIntentionId: downloadIntentionId
        };
        const bufferCommitment = Buffer.from(JSON.stringify(commitmentContent));
        sign.update(bufferCommitment);
        const contentSignature = sign.sign(userPrivateKey, SIGNATURE_FORMAT);
        this.commitmentMessage = {
            content: commitmentContent,
            signature: contentSignature,
        };
    }

    public getReceiver() {
        return this.commitmentMessage.content.receiverFingerprint;
    }

    public getTorrent() {
        return this.commitmentMessage.content.magneticLink;
    }

    public getPayer() {
        return this.commitmentMessage.content.payerFingerprint;
    }

    public static validateSignature(commitmentToValidate: CommitmentMessage, certificate: string): boolean{
        const verify = crypto.createVerify(ALGORITHM);
        const bufferCommitment = Buffer.from(JSON.stringify(commitmentToValidate.content));
        
        verify.update(bufferCommitment)
        
        const verification = verify.verify(certificate, commitmentToValidate.signature, SIGNATURE_FORMAT);

        return verification;
    }
}