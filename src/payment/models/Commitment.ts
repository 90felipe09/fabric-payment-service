export type Commitment = {
    content: {
        payerPublicKey: string,
        receiverPublicKey: string,
        hashRoot: string
    },
    signature: string
}