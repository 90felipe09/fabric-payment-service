import { TorrenteWallet } from "../../../payment/models/TorrenteWallet";
import { INotificationModel, NotificationTypesEnum } from "./NotificationModel";

export interface IWalletRefreshData {
    wallet: TorrenteWallet;
}

export class WalletRefreshNotification implements INotificationModel <IWalletRefreshData>{
    data: IWalletRefreshData;
    type: NotificationTypesEnum;

    constructor(data: IWalletRefreshData){
        this.type = NotificationTypesEnum.WalletNotification;
        this.data = data;
    }

    getWalletRefreshData(): IWalletRefreshData{
        return this.data;
    }

    getNotificationObject(): INotificationModel<IWalletRefreshData>{
        return {
            type: this.type,
            data: this.data
        };
    }

    // setWalletRefreshData(magneticLink?: string,  payerIp?: string) { 
    //     magneticLink && (this.data.magneticLink = magneticLink);
    //     payerIp && (this.data.payerIp = payerIp);
    // }

}