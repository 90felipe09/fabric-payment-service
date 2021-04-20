import { Commitment } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

export class PaymentController {
    commitment: Commitment;
    hashChain: HashChain;

    public constructor (
        receiverPublicKey: string,
        userPrivateKey: string,
        paymentSize: number) {
        this.hashChain = new HashChain(paymentSize);
        this.commitment = this.createCommitmentToUploader(
            receiverPublicKey, 
            userPrivateKey, 
            this.hashChain.getHashRoot());
    }

    public payHash() {
        return this.hashChain.payHash();
    }

    private createCommitmentToUploader(
        receiverPublicKey: string,
        userPrivateKey: string,
        hashRoot: string) : Commitment {
        const commitmentContent = {
            payerPublicKey: getPublicKey(userPrivateKey),
            receiverPublicKey: receiverPublicKey,
            hashRoot: hashRoot
        };

        const contentSignature = signObject(commitmentContent, userPrivateKey);

        return {
            content: commitmentContent,
            signature: contentSignature
        }
    }
}