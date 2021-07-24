import { GatewayConnection } from "../connections/GatewayConnection";
import { Contract, Gateway, GatewayOptions, Network, X509Identity } from 'fabric-network';
import { IAuthenticatedMessageData, AuthenticatedMessage } from "../../torrente/messages/models/AuthenticatedMessage"
import { PAYMENT_CHANNEL, PAYMENT_INTENTION_CONTRACT, REDEEM_CONTRACT } from '../config';

export class SmartContract {

    gatewayConnection : GatewayConnection;
    contract : Contract;
    smartContractName : string;
    
    public constructor (credentials: IAuthenticatedMessageData, smartContractName: string){
        this.gatewayConnection = new GatewayConnection(credentials);
        this.smartContractName = smartContractName;
    }

    public init = async () => {
        this.contract = await this.gatewayConnection.getMicropaymentChaincodeReference(this.smartContractName);
    };

    protected invokeTransaction = async (name: string, args: any[]): Promise<any> => {
        try {
            return this.contract.submitTransaction(name, ...args);
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return error.message
        }
    }
}