import { HYPERLEDGER_DNS } from "../config"
import { ConnectionProfile } from "../models/ConnectionProfile";


export const connectionProfileAdapter = (rawProfile: ConnectionProfile): ConnectionProfile => {
    const peerName = Object.keys(rawProfile.peers)[0];
    rawProfile.peers[peerName].url = rawProfile.peers[peerName].url.replace("localhost", HYPERLEDGER_DNS)
    const caName = Object.keys(rawProfile.certificateAuthorities)[0];
    rawProfile.certificateAuthorities[caName].url = rawProfile.certificateAuthorities[caName].url.replace("localhost", HYPERLEDGER_DNS)
    return rawProfile;
}
