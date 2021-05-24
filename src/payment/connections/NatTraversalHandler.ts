import portControl from 'nat-puncher';
import { PAYFLUXO_LISTENING_PORT, PAYFLUXO_EXTERNAL_PORT } from '../../config';
import { NotificationTypesEnum } from '../../notification/models/NotificationModel';

type NatTraversalProbing = {
    natPmp: boolean,
    pcp: boolean,
    upnp: boolean
}

const handleNatTraversalProbing = (probingResult: NatTraversalProbing) =>{
    if (Object.values(probingResult).includes(true)){
        portControl.addMapping(
            PAYFLUXO_LISTENING_PORT, 
            PAYFLUXO_EXTERNAL_PORT, 
            0
        );
    }
    else {
        throw new Error(NotificationTypesEnum.NATNotifcation);
    }
}

export const tryNatTraversal = async () => {
    portControl.probeProtocolSupport().then(handleNatTraversalProbing);
}