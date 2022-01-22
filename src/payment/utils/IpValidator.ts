import { isIPv4, isIPv6 } from "net";

export const validateIp = (incomingIp: string): string => {
    // validateIp
    //  If it's a IPv6, wraps it with brackets in order to viabilize calls;
    //  Doesn't changes IPv4;
    //  Throw exception is is not a IP at all;
    if (isIPv6(incomingIp)){
        incomingIp = `[${incomingIp}]`
    }
    else if (!isIPv4(incomingIp)) {
        throw(Error("Invalid IP Address. Not a IPv4 or IPv6"));
    }
    return incomingIp;
}