export interface IpaymentNotifyData<T> {
 
    event : string;
    torrentId: string;
    UserIp: string;
    deserialize(input: Object): T;
}

export class paymentNotifyData implements IpaymentNotifyData <paymentNotifyData>{

    event : string;
    torrentId: string;
    UserIp: string;

    constructor(){}

    deserialize(input) {
        this.event = input.event
        this.torrentId = input.torrentId
        this.UserIp = input.UserIp;
        return this
    };

    getPaymentData(){
        return this
    }

    setPaymentData(event : string,  torrentId: string,  UserIp: string) { 
        
        this.event = event
        this.torrentId = torrentId
        this.UserIp = UserIp
        return this
    }

}