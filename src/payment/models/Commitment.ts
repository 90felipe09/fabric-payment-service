export type Commitment = {
    content: {
        torrentId: string
        payerPublicKey: string,
        receiverPublicKey: string,
        hashRoot: string
    },
    signature: string
}