import sha256 from 'crypto-js/sha256';

export class HashChain {
    hashes: string[];
    hashToPay: number;

    public constructor (size: number){
        const firstHash: string = sha256(Math.random().toString()).toString();
        this.hashes = [firstHash];
        for (let index = 0; index < size; index++) {
            this.hashes.push(sha256(this.hashes[index]).toString());
        }
        this.hashToPay = size;
    }

    public payHash(): string {
        const hashToReturn: string = this.hashes[this.hashToPay];
        this.hashToPay -= 1;
        return hashToReturn;
    }

    public getHashRoot(): string {
        return this.hashes[this.hashes.length - 1];
    }
}