export type CommitmentMessage = {
    data: CommitmentContent;
    commitment_hash: string;
    hashing_alg: string;
    signature_alg: string;
    signature: string;
}

export type CommitmentContent = {
    payment_intention_id: string;
    receiver_address: string;
    payer_address: string;
    hash_root: string;
    data_id: string;
}
