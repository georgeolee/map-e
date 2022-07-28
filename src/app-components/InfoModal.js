import { useEffect } from "react";
import { Info } from "./Info";
import { settings } from "../refactor/globals";

export function InfoModal(props){


    const {
        visible,
        hideModal,
    } = props;

    useEffect(()=>{
        settings.modalLock = visible;
    })

    return(
        <div             
            id='info-modal'
            className={visible ? 'visible' : 'hidden'}>

            <div id='info-modal-content'>
                <button onClick={hideModal}>X</button>
                <Info/>
            </div>

        </div>
    );
}