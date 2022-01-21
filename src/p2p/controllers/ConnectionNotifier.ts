import { Subject, Observer } from "../models/ObserverPattern";
import { IPayfluxoRequestModel } from "../models/PayfluxoRequestModel";

export class ConnectionNotifier implements Subject{
    private observers: Observer[];
    private messagesQueue: IPayfluxoRequestModel<any>[]

    public constructor() {
        this.observers = []
    }

    public attach(observer: Observer): void {
        if (!this.observers.includes(observer))
            this.observers.push(observer);
    }

    public detach(observer: Observer): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex !== -1)
            this.observers.splice(observerIndex, 1);
    }

    public notify(): void {
        this.observers.forEach(observer => {
            observer.update(this)
        })
        this.messagesQueue = [];
    }

    public addMessageToQueue(message: IPayfluxoRequestModel<any>): void {
        this.messagesQueue.push(message)
    }
}