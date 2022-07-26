import { useRef } from "react";
import { Info } from "./Info";

export function InfoModal(props){

    const modalRef = useRef()

    const {
        visible,
        hideModal,
    } = props;


    return(
        <div             
            ref={modalRef}
            id='info-modal'
            className={visible ? 'visible' : 'hidden'}>

            <div id='info-modal-content'>
                <button onClick={hideModal}>X</button>
                <Info/>
            </div>

        </div>
    );
}