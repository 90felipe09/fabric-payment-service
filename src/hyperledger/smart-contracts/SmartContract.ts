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

    protected invokeTransaction = async (name: string, args: any[]): Promise<any> => {
        try {
            console.log(`[INFO] Perform transaction invoke ${name}(${args})`)
            return JSON.parse((await this.contract.submitTransaction(name, ...args)).toString());
        } catch (error) {
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }

    protected evaluateTransaction = async (name: string, args: any[]): Promise<any> => {
        try {
            console.log(`[INFO] Perform transaction evaluation ${name}(${args})`)
            const stringfiedResponse = (await this.contract.evaluateTransaction(name, ...args)).toString()
            return await JSON.parse(stringfiedResponse);
        } catch (error) {
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }
}