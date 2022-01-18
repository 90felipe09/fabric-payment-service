import jsrsasign from "jsrsasign"

export const getAddress = (certificate: string) : string => {
    const x509 = new jsrsasign.X509();
    x509.readCertPEM(certificate);
    const fingerprint256 = jsrsasign.KJUR.crypto.Util.hashHex(x509.hex, 'sha256')
    return fingerprint256
}
