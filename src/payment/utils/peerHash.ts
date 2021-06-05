export const getPeerHash = (peerIp: string, magneticLink: string) => {
    return `${magneticLink}@${peerIp}`;
}