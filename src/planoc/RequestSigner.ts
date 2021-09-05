import crypto from 'crypto';
import sha256 from 'crypto-js/sha256';
import { ALGORITHM, SIGNATURE_FORMAT } from '../payment/models/Commitment';
import { getAddress } from '../payment/utils/userAddress';

export interface SignedRequest<T> {
    content: T;
    fingerprint: string;
    signature: string;
}

export class RequestSigner{
    public static signRequest<T>(content: T, privateKey: string, certificate: string): SignedRequest<T>{
        const sign = crypto.createSign(ALGORITHM);
        const requestString = sha256(JSON.stringify(content)).toString()
        
        sign.update(requestString);
        const contentSignature = sign.sign(privateKey, SIGNATURE_FORMAT);

        return {
            content: content,
            fingerprint: getAddress(certificate),
            signature: contentSignature
        };
    }

}