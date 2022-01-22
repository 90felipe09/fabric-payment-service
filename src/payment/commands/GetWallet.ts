import { TorrenteWallet } from "../models/TorrenteWallet";
import { getAvailableFunds } from "./GetAvailableFunds";
import { getFrozenValues } from "./GetFrozenValues";
import { getReedemableValues } from "./GetReedemableValues";

export const getWallet = async (): Promise<TorrenteWallet> => {
    const availableFunds: number = await getAvailableFunds();
    const reedemableValues: number = await getReedemableValues();
    const frozenValues: number = await getFrozenValues();
    return {
        available: availableFunds,
        frozen: frozenValues,
        redeemable: reedemableValues
    }
}