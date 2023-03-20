import { Contract } from 'fabric-network';
import { PayfluxoConsole } from '../../console/Console';
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
        const console = PayfluxoConsole.getInstance();
        try{
            console.debug(`Fetching chaincode reference for ${this.smartContractName}`)
            this.contract = await this.gatewayConnection.getMicropaymentChaincodeReference(this.smartContractName);
            console.sucess(`Contract reference obtained: ${this.smartContractName}:${this.contract.chaincodeId}`)
        }
        catch (error){
            console.error(`Couldn't fetch contract reference: ${error}`)
        }
    };

    protected invokeTransaction = async (name: string, args: any[]): Promise<any> => {
        const console = PayfluxoConsole.getInstance();
        try {
            console.debug(`Perform transaction invoke ${name}(${args})`)
            return JSON.parse((await this.contract.submitTransaction(name, ...args)).toString());
        } catch (error) {
            console.error(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }

    protected evaluateTransaction = async (name: string, args: any[]): Promise<any> => {
        const console = PayfluxoConsole.getInstance();
        try {
            console.debug(`[INFO] Perform transaction evaluation ${name}(${args})`)
            const transactionResponse = await this.contract.evaluateTransaction(name, ...args);
            const stringfiedResponse = transactionResponse.toString();
            const jsonObject = JSON.parse(stringfiedResponse);
            return jsonObject;
        } catch (error) {
            console.error(`[ERROR] Smart Contract error: ${error}`)
            throw error
        }
    }
}