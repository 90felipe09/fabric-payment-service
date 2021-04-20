import { X509Provider } from "fabric-network/lib/impl/wallet/x509identity";
import { TorrentePaymentReceivedSocket } from "../connections/TorrentePaymentReceivedSocket";
import { Commitment } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

export class PaymentController {
    commitment: Commitment;
    hashChain: HashChain;

    public constructor (
        ip: string,
        receiverPublicKey: string,
        paymentSize: number,
        userPrivateKey: string,
        torrentId: string
        ) {
        this.hashChain = new HashChain(paymentSize);
        this.createCommitmentToUploader(
            torrentId,
            receiverPublicKey, 
            this.hashChain.getHashRoot(),
            userPrivateKey).then(this.setCommitment);
    }

    private setCommitment (commitment: Commitment) {
        this.commitment = commitment;
    }

    public payHash() {
        return this.hashChain.payHash();
    }

    public isSeekingInstance(receiverPublicKey: string, torrentId: string){
        return (
            this.getReceiver() === receiverPublicKey && 
            this.getTorrent() === torrentId);
    }

    public getReceiver() {
        return this.commitment.content.receiverPublicKey;
    }

    public getTorrent() {
        return this.commitment.content.torrentId;
    }

    private async createCommitmentToUploader(
        torrentId: string,
        receiverPublicKey: string,
        hashRoot: string,
        userPrivateKey: string
        ) : Promise<Commitment> {
        const userIdentityProvider = new X509Provider();
        const cryptoSuite = userIdentityProvider.getCryptoSuite();
        const privateKey = await cryptoSuite.getKey(userPrivateKey);
        const commitmentContent = {
            torrentId: torrentId,
            payerPublicKey: cryptoSuite.deriveKey(privateKey).toBytes().toString(),
            receiverPublicKey: receiverPublicKey,
            hashRoot: hashRoot
        };
        const bufferCommitment = Buffer.from(JSON.stringify(commitmentContent));
        const contentSignature = cryptoSuite.sign(privateKey, bufferCommitment);

        return {
            content: commitmentContent,
            signature: contentSignature.toString()
        }
    }
}