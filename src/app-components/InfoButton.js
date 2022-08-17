import { useState } from "react";
import { Modal } from "./Modal";
import {Info} from './Info';

export function InfoButton(props){

    const [showing, showModal] = useState(false);

    const buttonProps = {
        id:'info-button',
        onClick: e => {
            showModal(true)
            // e.stopPropagation()
        },
    }

    const modalProps = {
        visible: showing,
        hideModal: () => showModal(false),
        content: <Info/>,
    }


    return(

        <>
            <button {...buttonProps}>            
                ?
            </button>
            <Modal {...modalProps}/>
        </>
        
    );
}