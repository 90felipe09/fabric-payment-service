import { Subject, Observer } from "../models/ObserverPattern";
import { IPayfluxoRequestModel } from "../models/PayfluxoRequestModel";

export class ConnectionNotifier implements Subject{
    private observers: Observer[];
    private messageStored: IPayfluxoRequestModel<any>

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
    }

    public updateMessage(message: IPayfluxoRequestModel<any>): void {
        this.messageStored = message;
        this.notify();
    }

    public getMessage<T>(): IPayfluxoRequestModel<T> {
        return this.messageStored
    }
}