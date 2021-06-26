import { Commitment, CommitmentMessage } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

describe("test Commitment class", () => {
    const torrentIdTest = "torrentIdTest";
    const receiverPublicKeyTest = "receiverPublicKeyTest";
    const hashChainTest = new HashChain();
    hashChainTest.initHashChain(2);
    const privateKeyStringTest = "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgAuzqAU+NF2D1TqOs\r\nIFAiowyTvHcja6JaBsTpzXJI56uhRANCAAQmoCGwk9+Af9T6YdPez3Dboh6SUcze\r\nnoXqg5JeNr2sh0vuG/Y9Qw/phidXg6N665mM+mhk3jilIyz3ciPa6CX1\r\n-----END PRIVATE KEY-----\r\n";

    const testCommitment = new Commitment();
    testCommitment.initCommitment(
        torrentIdTest,
        receiverPublicKeyTest,
        hashChainTest.getHashRoot(),
        privateKeyStringTest,
        receiverPublicKeyTest
    )

    it("should have signature validated.", async () => {
        var falseCommitment: CommitmentMessage = {
            content: {
                magneticLink: torrentIdTest,
                payerFingerprint: receiverPublicKeyTest,
                receiverFingerprint: receiverPublicKeyTest,
                hashRoot: "fake hash"
            },
            signature: testCommitment.commitmentMessage.signature
        }

        const truthyValidation = Commitment.validateSignature(testCommitment.commitmentMessage, receiverPublicKeyTest);
        expect(truthyValidation).toBeTruthy();
        console.log(testCommitment.commitmentMessage.content);
        console.log("\n\t" + truthyValidation);
        const fakeValidation = Commitment.validateSignature(falseCommitment, receiverPublicKeyTest);
        expect(fakeValidation).toBeFalsy();
        console.log(falseCommitment.content);
        console.log("\n\t" + fakeValidation);
    });
});