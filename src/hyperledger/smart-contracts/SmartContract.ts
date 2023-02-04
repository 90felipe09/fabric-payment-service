import { Contract } from 'fabric-network';
import { UserIdentification } from '../../payment/models/UserIdentification';
import { GatewayConnection } from "../connections/GatewayConnection";

export class SmartContract {

    gatewayConnection : GatewayConnection;
    contract : Contract;
    smartContractName : string;
    
    public constructor (credentials: UserIdentification, smartContractName: string){
        this.gatewayConnection = new GatewayConnection(credentials);
        this.smartContractName = smartContractName;
    }

    public close = () => {
        this.gatewayConnection.peerGateway.disconnect();
    }

    public init = async () => {
        try{
            console.log(`[INFO] Fetching chaincode reference for ${this.smartContractName}`)
            this.contract = await this.gatewayConnection.getMicropaymentChaincodeReference(this.smartContractName);
            console.log(`[INFO] Contract reference obtained: ${this.contract.chaincodeId}`)
        }
        catch (error){
            console.log(`[ERROR] Couldn't fetch contract reference: ${error}`)
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
            const transactionResponse = await this.contract.evaluateTransaction(name, ...args);
            const stringfiedResponse = transactionResponse.toString();
            const jsonObject = JSON.parse(stringfiedResponse);
            return jsonObject;
        } catch (error) {
            console.log(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }
}