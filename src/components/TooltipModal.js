import { useState, useEffect, useRef } from "react";
import { display } from "../refactor/globals";
import { Modal } from "./Modal";

export function TooltipModal(props){

    const [tooltip, setTooltip] = useState('');

    // const [v]

    useEffect(()=>{
        console.log('tooltip modal render')

        display.setTooltip = t => setTooltip(t);
    })

    return (

        <div
            id='modal-wrapper'

            style={{
                position: 'fixed',
                width:'100vw',
                height:'100vh',
                touchAction:'none',
                pointerEvents:'none',

                alignItems:'center',
                justifyContent:'center'
            }}>

        <Modal
            visible={!!tooltip}
            content={tooltip}
            />
        </div>
        )
}