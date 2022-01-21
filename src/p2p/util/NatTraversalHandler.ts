import portControl from 'nat-puncher';
import { PAYFLUXO_LISTENING_PORT, PAYFLUXO_EXTERNAL_PORT, PORT_MAPPING_EXPIRATION } from '../../config';
import { NotificationTypesEnum } from '../../torrente/notification/models/NotificationModel';

const handleNatTraversalProbing = async () =>{
    portControl.addMapping(
        PAYFLUXO_LISTENING_PORT, 
        PAYFLUXO_EXTERNAL_PORT, 
        PORT_MAPPING_EXPIRATION
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
