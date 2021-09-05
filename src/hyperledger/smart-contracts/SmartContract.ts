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
        try{
            console.log(`[INFO] Fetching chaincode reference for ${this.smartContractName}`)
            this.contract = await this.gatewayConnection.getMicropaymentChaincodeReference(this.smartContractName);
            console.log(`[INFO] Contract reference obtained: ${this.contract.chaincodeId}`)
        }
        catch (error){
            console.log(`[ERROR] Couldn't feetch contract reference: ${error}`)
        }
    };

    protected invokeTransaction = async (transactionName: string, args: any[]): Promise<any> => {
        try {
            console.log(`[INFO] Perform transaction invoke ${transactionName}(${args})`)
            const name = `${this.smartContractName}:${transactionName}`;
            return this.contract.submitTransaction(name, ...args);
        } catch (error) {
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }

    protected evaluateTransaction = async (transactionName: string, args: any[]): Promise<any> => {
        try {
            const name = `${this.smartContractName}:${transactionName}`;
            console.log(`[INFO] Perform transaction evaluation ${name}(${args})`)
            return await this.contract.evaluateTransaction(name, ...args);
        } catch (error) {
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }
}