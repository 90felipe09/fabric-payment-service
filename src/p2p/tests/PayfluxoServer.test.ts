import assert from 'assert';
import { PayfluxoServer } from '../../p2p/connections/PayfluxoServer';
import { PayfluxoConnectionSimulator } from './PayfluxoConnectionSimulator';

jest.setTimeout(20000)

describe("test PayfluxoServer class", () => {
    new PayfluxoServer();
    const payfluxoServer = PayfluxoServer.getInstance();

    const payfluxoSimulator = new PayfluxoConnectionSimulator();

    it("should start the payfluxo server.", async (done) => {
        payfluxoSimulator.payfluxoSocket.on('open', () => {
            const connectionsMap = payfluxoServer.getConnectionsMap();
            assert(Object.keys(connectionsMap.getConnections()).length !== 0);
            const connection = Object.values(connectionsMap.getConnections())[0]
            connection.requestCertificate();
            connection.sendPayment('asd', 123, 'test');
            connection.acceptCommitment();
            connection.rejectCommitment();
        });
        payfluxoSimulator.payfluxoSocket.on('message', (message) => {
            if (message.toString().includes('Denied')){
                payfluxoSimulator.close();
                PayfluxoServer.closeServer()
            }
        })
        payfluxoSimulator.payfluxoSocket.on('close', () => {
            done();
        })
    });
});
