import crypto from 'crypto';
import sha256 from 'crypto-js/sha256';
import { ALGORITHM, Commitment, CommitmentContent, CommitmentMessage, HASHING_ALG_NAME, SIGNATURE_ALGORITHM, SIGNATURE_FORMAT } from "../models/Commitment";
import { HashChain } from "../models/HashChain";

describe("test Commitment class", () => {
    const torrentIdTest = "torrentIdTest";
    const receiverPublicKeyTest = "-----BEGIN CERTIFICATE-----\nMIICljCCAjygAwIBAgIUcVFiuJI0IlYyvzwrzp1tl8KL9AswCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIxMTExMzE4MjAwMFoXDTIyMTExMzE5MzcwMFowTTEcMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDEtMCsGA1UEAxMkNDc4MDk0YjYtMzlj\nOC00MDMwLWIxODctNmEyNWE5YTJkZDJjMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAEW1Yx4YqWj17szSa7YsNRXSTh50xVry/FXxPdmVLySscEAYSgY62MWnIm8gD0\ntCsKYuHs2P1j7e7Nc5SxbjvWPKOB3jCB2zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUdWPmenLn4ShDvU3rEfjOhG61fe8wHwYDVR0jBBgw\nFoAUkPvuAV9ce5BMHU8yHVwNsXYMQqgwewYIKgMEBQYHCAEEb3siYXR0cnMiOnsi\naGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElEIjoiNDc4MDk0\nYjYtMzljOC00MDMwLWIxODctNmEyNWE5YTJkZDJjIiwiaGYuVHlwZSI6ImNsaWVu\ndCJ9fTAKBggqhkjOPQQDAgNIADBFAiEAv4q7FX4iyhpP4WPPwliX9qVLQCA22Pr1\nPj8fM40rMBACIDSEpKAan2GkJVNYnOe03FN2tytm9UJREkyJ2FWUo1u+\n-----END CERTIFICATE-----\n";
    const hashChainTest = new HashChain();
    hashChainTest.initHashChain(2);
    const privateKeyStringTest = "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgF8UUnnRu4LJGr06y\r\n8Kdq6Opy9nHYD+pIRt7xtv9IZO6hRANCAARbVjHhipaPXuzNJrtiw1FdJOHnTFWv\r\nL8VfE92ZUvJKxwQBhKBjrYxacibyAPS0Kwpi4ezY/WPt7s1zlLFuO9Y8\r\n-----END PRIVATE KEY-----\r\n";
    const publicKeyStringTest = "-----BEGIN CERTIFICATE-----\nMIICljCCAjygAwIBAgIUcVFiuJI0IlYyvzwrzp1tl8KL9AswCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIxMTExMzE4MjAwMFoXDTIyMTExMzE5MzcwMFowTTEcMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDEtMCsGA1UEAxMkNDc4MDk0YjYtMzlj\nOC00MDMwLWIxODctNmEyNWE5YTJkZDJjMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAEW1Yx4YqWj17szSa7YsNRXSTh50xVry/FXxPdmVLySscEAYSgY62MWnIm8gD0\ntCsKYuHs2P1j7e7Nc5SxbjvWPKOB3jCB2zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUdWPmenLn4ShDvU3rEfjOhG61fe8wHwYDVR0jBBgw\nFoAUkPvuAV9ce5BMHU8yHVwNsXYMQqgwewYIKgMEBQYHCAEEb3siYXR0cnMiOnsi\naGYuQWZmaWxpYXRpb24iOiJvcmcxIiwiaGYuRW5yb2xsbWVudElEIjoiNDc4MDk0\nYjYtMzljOC00MDMwLWIxODctNmEyNWE5YTJkZDJjIiwiaGYuVHlwZSI6ImNsaWVu\ndCJ9fTAKBggqhkjOPQQDAgNIADBFAiEAv4q7FX4iyhpP4WPPwliX9qVLQCA22Pr1\nPj8fM40rMBACIDSEpKAan2GkJVNYnOe03FN2tytm9UJREkyJ2FWUo1u+\n-----END CERTIFICATE-----\n"

    const testCommitment = new Commitment();
    testCommitment.initCommitment(
        torrentIdTest,
        receiverPublicKeyTest,
        hashChainTest.getHashRoot(),
        privateKeyStringTest,
        publicKeyStringTest,
        torrentIdTest
    )

    it("should have signature validated.", async () => {
        const fakeCommitmentData: CommitmentContent = {
            data_id: torrentIdTest,
            payer_address: receiverPublicKeyTest,
            receiver_address: receiverPublicKeyTest,
            hash_root: "fake hash",
            payment_intention_id: torrentIdTest
        }
        const fakeCommitmentString = JSON.stringify(fakeCommitmentData);
        var falseCommitment: CommitmentMessage = {
            data: fakeCommitmentData,
            commitment_hash: sha256(fakeCommitmentString).toString(),
            hashing_alg: HASHING_ALG_NAME,
            signature_alg: SIGNATURE_ALGORITHM,
            signature: testCommitment.commitmentMessage.signature
        }

        const truthyValidation = Commitment.validateSignature(testCommitment.commitmentMessage, receiverPublicKeyTest);
        expect(truthyValidation).toBeTruthy();
        const fakeValidation = Commitment.validateSignature(falseCommitment, receiverPublicKeyTest);
        expect(fakeValidation).toBeFalsy();
    });
});