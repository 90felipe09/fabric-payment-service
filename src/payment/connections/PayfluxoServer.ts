import express from 'express';
import http from 'http';
import { PAYFLUXO_LISTENING_PORT } from '../../config';
import { SessionController } from '../controllers/SessionController';

export const startPayfluxoServer = (privateKey: string) => {
    const app = express();
    const server = http.createServer(app);
    const sessionController = new SessionController(privateKey);

    server.listen( PAYFLUXO_LISTENING_PORT, () => {
        console.log(`Payfluxo started on port: ${PAYFLUXO_LISTENING_PORT}`);
    }) 

    app.post('/pay', (req, res) => {
        //handle hash payment
        sessionController.handleReceive();
    })

    app.post('/commit', (req, res) => {
        //handle commit request
        sessionController.handleCommit();
    })

    app.get('/', (req, res) => {
        return "I'm listening";
    })
}