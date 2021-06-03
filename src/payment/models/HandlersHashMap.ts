import { PaymentHandler } from "../controllers/PaymentHandler";
import { ReceiverHandler } from "../controllers/ReceiverHandler";

export type PaymentHashMap = {
    [key: string]: PaymentHandler;
}

export type ReceiverHashMap = {
    [key: string]: ReceiverHandler;
}