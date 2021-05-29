import elliptic from 'elliptic';

export type CommitmentMessage = {
    content: CommitmentContent,
    signature: string
}

export type CommitmentContent = {
    torrentId: string
    payerPublicKey: string,
    receiverPublicKey: string,
    hashRoot: string
}

export class Commitment {
    commitmentMessage: CommitmentMessage;

    public constructor(
        torrentId: string, 
        receiverPublicKey: string,
        hashRoot: string, 
        userPrivateKey: string,
    ){
        const EC = elliptic.ec;
        const ecdsaCurve = elliptic.curves['p256'];
        const ecdsa = new EC(ecdsaCurve);

        const signKey = ecdsa.keyFromPrivate(userPrivateKey, 'hex');
        const derivKey = signKey.getPublic().encode('hex', false);

        // now we have the signature, next we should send the signed transaction proposal to the peer

        const commitmentContent = {
            torrentId: torrentId,
            payerPublicKey: derivKey.toString(),
            receiverPublicKey: receiverPublicKey,
            hashRoot: hashRoot
        };
        const bufferCommitment = Buffer.from(JSON.stringify(commitmentContent));
        const contentSignature = Buffer.from(ecdsa.sign(bufferCommitment, signKey).toDER());
        this.commitmentMessage = {
            content: commitmentContent,
            signature: contentSignature.toString('base64'),
        };
    }

    public getReceiver() {
        return this.commitmentMessage.content.receiverPublicKey;
    }

    public getTorrent() {
        return this.commitmentMessage.content.torrentId;
    }

    public getPayer() {
        return this.commitmentMessage.content.payerPublicKey;
    }

    public static validateSignature(commitmentToValidate: CommitmentMessage): boolean{
        const payerPublicKeyString = commitmentToValidate.content.payerPublicKey;

        const EC = elliptic.ec;
        const ecdsaCurve = elliptic.curves['p256'];
        const ecdsa = new EC(ecdsaCurve);

        const signatureBytes = Buffer.from(commitmentToValidate.signature, 'base64');
        const messageBytes = Buffer.from(JSON.stringify(commitmentToValidate.content));
        const payerPublicKey = ecdsa.keyFromPublic(payerPublicKeyString, 'hex');

        return payerPublicKey.verify(messageBytes, signatureBytes);
    }
}