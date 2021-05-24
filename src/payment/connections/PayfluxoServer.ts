import express from 'express';
import http from 'http';
import { PAYFLUXO_LISTENING_PORT } from '../../config';

export const startPayfluxoServer = () => {
    const app = express();
    const server = http.createServer(app);

    server.listen( PAYFLUXO_LISTENING_PORT, () => {
        console.log(`Payfluxo started on port: ${PAYFLUXO_LISTENING_PORT}`);
    }) 

    app.post('/pay', (req, res) => {
        //handle hash payment
    })

    app.post('/commit', (req, res) => {
        //handle commit request
    })

    app.get('/', (req, res) => {
        return "I'm listening";
    })
}