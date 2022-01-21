export const getPeerHash = (peerIp: string, magneticLink: string) => {
    return `${magneticLink}@${peerIp}`;
}

export const getConnectionHash = (ip: string, port: number): string => {
    return `${ip}:${port}`
}
