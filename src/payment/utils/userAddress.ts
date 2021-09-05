import jsrsasign from "jsrsasign"

export const getAddress = (certificate: string) : string => {
    const x509 = new jsrsasign.X509();
    x509.readCertPEM(certificate);
    const hex = x509.hex;
    const fingerprint256 = jsrsasign.KJUR.crypto.Util.sha256(hex)
    return fingerprint256
}