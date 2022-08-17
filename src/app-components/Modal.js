import { useEffect } from "react";
import { settings } from "../refactor/globals";

export function Modal(props){


    const {
        id,
        visible,
        hideModal,
        content,
    } = props;

    useEffect(()=>{
        settings.modalLock = visible;
        
        // if(visible) document.documentElement.classList.add('modal-visible');
        // else document.documentElement.classList.remove('modal-visible');
    })

    return(
        <div
            id={id}
            className={`modal ${visible ? 'visible' : 'hidden'}`}
            >

            <div className='modal-content'>
                <button className='modal-close-button' onClick={hideModal}>X</button>
                {content}
            </div>

        </div>
    );
}