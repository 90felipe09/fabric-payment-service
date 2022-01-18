import { HyperledgerPaymentService } from "./hyperledger/HyperledgerPaymentService";
import { PaymentServiceInterface } from "./payment/models/PaymentServiceInterface";
import { PlanocPaymentService } from "./planoc/PlanocPaymentService";

export const TORRENTE_NOTIFICATION_PORT = 7933;
export const PAYFLUXO_LISTENING_PORT = 9003;
export const PAYFLUXO_EXTERNAL_PORT = 9003;
export const PORT_MAPPING_EXPIRATION = 0;

// Prod
// export const PAYFLUXO_USING_PORT = PAYFLUXO_EXTERNAL_PORT;

// Test
export const PAYFLUXO_USING_PORT = PAYFLUXO_LISTENING_PORT;

// With blockchain
// export const PAYMENT_SERVICE: PaymentServiceInterface = new HyperledgerPaymentService();
export const PAYMENT_SERVICE: PaymentServiceInterface = new HyperledgerPaymentService();