import crypto from 'crypto'
import { generateSalt, LyraHash } from 'lyra2-amazon';

const algorithm = 'aes-256-cfb';

const KEY_SIZE = 32;
const SALT_LENGTH = 16;

export const ArrayBufferToBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
    const buffer = Buffer.from(arrayBuffer)
    
    return buffer;
}

export const splitKeyIv = (keyHash: ArrayBuffer): [Buffer, Buffer] => {
    const bufferKey = ArrayBufferToBuffer(keyHash);
    const key = bufferKey.slice(0, KEY_SIZE);
    const iv = bufferKey.slice(KEY_SIZE, KEY_SIZE  + KEY_SIZE / 2);
    return [key, iv];
}

export const encrypt = (keyHash: ArrayBuffer, text: string): string => {
    const [key, iv] = splitKeyIv(keyHash);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(text, 'utf-8');
    const base64Encrypted = Buffer.from(encrypted).toString('base64');
    return base64Encrypted;
}

export const decrypt = (keyHash: ArrayBuffer, cypher: string): string => {
    const base64Cypher = Buffer.from(cypher, 'base64');
    const [key, iv] = splitKeyIv(keyHash);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = decipher.update(base64Cypher).toString('utf-8');
    return decrypted;
}

export const generateKey = (password: string, salt: string): ArrayBuffer => {
    const keyHash = LyraHash(password, salt, SALT_LENGTH);
    return keyHash;
}

export const generateKeyAndSalt = (password: string): [ArrayBuffer, string] => {
    const salt = generateSalt(SALT_LENGTH);
    const saltBytes = Buffer.from(salt);
    const encodedSalt = saltBytes.toString('base64');
    const keyHash = LyraHash(password, encodedSalt, SALT_LENGTH);
    return [keyHash, encodedSalt];
}
