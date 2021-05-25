import portControl from 'nat-puncher';
import { PAYFLUXO_LISTENING_PORT, PAYFLUXO_EXTERNAL_PORT } from '../config';
import { NotificationTypesEnum } from './notification/models/NotificationModel';

const handleNatTraversalProbing = async () =>{
    portControl.addMapping(
        PAYFLUXO_LISTENING_PORT, 
        PAYFLUXO_EXTERNAL_PORT, 
        0
    );
}

export const tryNatTraversal = async () => {
    const probingResult = await portControl.probeProtocolSupport();
    console.log(probingResult);
    if (Object.values(probingResult).includes(true)){
        await handleNatTraversalProbing();
    }
    else {
        throw new Error(NotificationTypesEnum.NATNotifcation);
    }
}