import { GatewayConnection } from "./GatewayConnection";
import { Contract, Gateway, GatewayOptions, Network, X509Identity } from 'fabric-network';
import { IAuthenticatedMessageData, AuthenticatedMessage } from "../../torrente/messages/models/AuthenticatedMessage"
import { PAYMENT_CHANNEL, PAYMENT_INTENTION_CONTRACT, REDEEM_CONTRACT } from '../config';

export class Invoke {


    credentials : IAuthenticatedMessageData;

    public constructor (credentials: IAuthenticatedMessageData){
        this.credentials = credentials;
    }

    public invokeTransaction = async (smartContract, data) => {
        try {
            const credentials = new GatewayConnection(this.credentials) ;
            
            let contract = await credentials.getMicropaymentChaincodeReference(smartContract);
            
            let result
            let message;
            if (smartContract === "createPaymentIntention" ) {
                result = await contract.submitTransaction(smartContract, data.id, data.magnetic_link, data.value_to_freeze, data.expiration_date, data.created_at);
                message = `Successfully created Payment Intention with id ${data.id}`
    
            } else if (smartContract === "RedeemContract") {
                result = await contract.submitTransaction(smartContract, data.id, data.commitment, data.hashLink, data.hashLinkIndex);
                message = `Successfully redeemed contract ${data.smartContract}`
            } 
            else {
                return `Invocation require either createPaymentIntention or RedeemContract as function but got ${smartContract}`
            }
    
            result = JSON.parse(result.toString());
    
            let response = {
                message: message,
                result
            }
            return response;
    
        } catch (error) {
    
            console.log(`Getting error: ${error}`)
            return error.message
    
        }
    }
}




