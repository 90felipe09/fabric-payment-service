import { Commitment, CommitmentMessage } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

describe("test Commitment class", () => {
    const torrentIdTest = "torrentIdTest";
    const receiverPublicKeyTest = "receiverPublicKeyTest";
    const hashChainTest = new HashChain(2);
    const privateKeyStringTest = "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgAuzqAU+NF2D1TqOs\r\nIFAiowyTvHcja6JaBsTpzXJI56uhRANCAAQmoCGwk9+Af9T6YdPez3Dboh6SUcze\r\nnoXqg5JeNr2sh0vuG/Y9Qw/phidXg6N665mM+mhk3jilIyz3ciPa6CX1\r\n-----END PRIVATE KEY-----\r\n";

    const testCommitment = new Commitment(
        torrentIdTest,
        receiverPublicKeyTest,
        hashChainTest.getHashRoot(),
        privateKeyStringTest
    );

    it("should have signature validated.", async () => {
        var falseCommitment: CommitmentMessage = {
            content: {
                torrentId: torrentIdTest,
                receiverPublicKey: receiverPublicKeyTest,
                hashRoot: "fake hash",
                payerPublicKey: testCommitment.commitmentMessage.content.payerPublicKey,
            },
            signature: testCommitment.commitmentMessage.signature
        }

        const truthyValidation = Commitment.validateSignature(testCommitment.commitmentMessage);
        expect(truthyValidation).toBeTruthy();
        console.log(testCommitment.commitmentMessage.content);
        console.log("\n\t" + truthyValidation);
        const fakeValidation = Commitment.validateSignature(falseCommitment);
        expect(fakeValidation).toBeFalsy();
        console.log(falseCommitment.content);
        console.log("\n\t" + fakeValidation);
    });
});