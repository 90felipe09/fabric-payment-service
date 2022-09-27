import { MessagesHandlersMap } from "./models/MessagesHandlersMap";


export class MessagesHandler {
    private static instance: MessagesHandler;
    private handlersMap: MessagesHandlersMap

    public static getInstance = (): MessagesHandler => {
        if (!MessagesHandler.instance) {
            throw Error("MessagesHandler not initialized yet");
        }
        return MessagesHandler.instance;
    }

    constructor(handlersMap: MessagesHandlersMap) {
        this.handlersMap = handlersMap;
        MessagesHandler.instance = this;
    }

    public handleMessage = (message: string) => {
        const messageObject = JSON.parse(message);
        this.handlersMap[messageObject['type']](messageObject['data']);
    }
}
