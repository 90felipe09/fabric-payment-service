import portControl from 'nat-puncher';
import { PAYFLUXO_LISTENING_PORT, PAYFLUXO_EXTERNAL_PORT } from '../../config';
import { NotificationTypesEnum } from '../../torrente/notification/models/NotificationModel';

type NatTraversalProbing = {
    natPmp: boolean,
    pcp: boolean,
    upnp: boolean
}

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