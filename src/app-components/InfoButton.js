import { useRef, useState } from "react";
import { InfoModal } from "./InfoModal";

export function InfoButton(props){

    const [showing, showModal] = useState(false);

    const buttonProps = {
        id:'info-button',
        onClick: () => showModal(true),
    }

    const modalProps = {
        visible: showing,
        hideModal: () => showModal(false),
    }


    return(

        <>
            <button {...buttonProps}>            
                ?
            </button>
            <InfoModal {...modalProps}/>
        </>
        
    );
}