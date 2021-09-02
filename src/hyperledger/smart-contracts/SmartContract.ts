import { Contract } from 'fabric-network';
import { IAuthenticatedMessageData } from "../../torrente/messages/models/AuthenticatedMessage";
import { GatewayConnection } from "../connections/GatewayConnection";

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
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }

    protected evaluateTransaction = async (name: string, args: any[]): Promise<any> => {
        try {
            return this.contract.evaluateTransaction(name, ...args);
        } catch (error) {
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }
}