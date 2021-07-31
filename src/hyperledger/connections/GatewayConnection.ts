import sha256 from 'crypto-js/sha256';
import { Contract, Gateway, GatewayOptions, Network, Wallet, Wallets, X509Identity } from 'fabric-network';
import { IAuthenticatedMessageData } from '../../torrente/messages/models/AuthenticatedMessage';
import { CHAINCODE_ID, PAYMENT_CHANNEL } from '../config';

var jsonfile = require('../connectionProfile.json');
export class GatewayConnection {
    private clientIdentity: X509Identity;

    public peerGateway: Gateway;
    public gatewayNetwork: Network;
    public chaincode: Contract;

    public wallet: Wallet;

    public constructor (credentials: IAuthenticatedMessageData){
        this.clientIdentity = this.getIdentity(credentials);
    }

    private connectToPeerGateway = async(): Promise<Gateway> => {
        if (!this.peerGateway) {
            const wallet = await Wallets.newInMemoryWallet();
            const userLabel: string = sha256(this.clientIdentity.credentials.certificate).toString();
            await wallet.put(userLabel, this.clientIdentity);
            this.wallet = wallet;
            const gatewayOptions: GatewayOptions = {
                identity: this.clientIdentity,
                wallet: wallet
            };
            const connectionProfile = jsonfile;
            const gateway = new Gateway();
            await gateway.connect(connectionProfile, gatewayOptions);
            this.peerGateway = gateway;
        }
        return this.peerGateway;
    }

    private getChannelNetwork = async(channelName: string): Promise<Network> => {
        if (!this.gatewayNetwork){
            const network = await this.peerGateway.getNetwork(channelName);
            this.gatewayNetwork = network;
        }
        
        return this.gatewayNetwork;
    }

    private getChaincodeReference = async(chaincodeId: string, contractName: string): Promise<Contract> => {
        if (!this.chaincode){
            const contract = this.gatewayNetwork.getContract(chaincodeId, contractName);
            this.chaincode = contract;
        }
        
        return this.chaincode;
    }

    public getMicropaymentChaincodeReference = async ( smartContract : string ): Promise<Contract> => {
        await this.connectToPeerGateway();
        await this.getChannelNetwork(PAYMENT_CHANNEL);
        const chaincode = await this.getChaincodeReference(CHAINCODE_ID, smartContract);
        return chaincode;
    }

    private getIdentity = (credentials: IAuthenticatedMessageData): X509Identity => {
        const x509identity: X509Identity = {
            credentials: {
                certificate: credentials.certificate,
                privateKey: credentials.privateKey,
            },
            mspId: credentials.mspId,
            type: "X.509"
        }
    
        return x509identity
    }
}
