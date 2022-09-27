import axios from 'axios';
import { Contract, Gateway, GatewayOptions, Network, Wallet, Wallets, X509Identity } from 'fabric-network';
import { UserIdentification } from '../../payment/models/UserIdentification';
import { getAddress } from '../../payment/utils/userAddress';
import { CHAINCODE_ID, HYPERLEDGER_CONNECTION_PROFILE, PAYMENT_CHANNEL } from '../config';
import { connectionProfileAdapter } from '../utils/ConnectionProfileAdapter';


export class GatewayConnection {
    private clientIdentity: X509Identity;

    public peerGateway: Gateway;
    public gatewayNetwork: Network;
    public chaincode: Contract;

    public wallet: Wallet;

    public constructor (credentials: UserIdentification){
        this.clientIdentity = this.getIdentity(credentials);
    }

    private connectToPeerGateway = async(): Promise<Gateway> => {
        if (!this.peerGateway) {
            const wallet = await Wallets.newInMemoryWallet();
            const userLabel: string = getAddress(this.clientIdentity.credentials.certificate);
            await wallet.put(userLabel, this.clientIdentity);
            this.wallet = wallet;
            const gatewayOptions: GatewayOptions = {
                identity: this.clientIdentity,
                wallet: wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: false                    
                }
            };
            const connectionProfileReq = await (axios.get(HYPERLEDGER_CONNECTION_PROFILE));
            const connectionProfile = connectionProfileAdapter(connectionProfileReq.data)
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

    private getIdentity = (credentials: UserIdentification): X509Identity => {
        const x509identity: X509Identity = {
            credentials: {
                certificate: credentials.certificate,
                privateKey: credentials.privateKey,
            },
            mspId: credentials.orgMSPID,
            type: "X.509"
        }
    
        return x509identity
    }
}
