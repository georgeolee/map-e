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
            id='tooltip-modal-wrapper'

            style={{
                // position: 'fixed',
                // width:'100vw',
                // height:'100vh',

                position: 'relative',
                display:'flex',
                maxHeight:'100px',
                
                // position:"absolute",
                // width:'100vw',
                // height:'100vh',
                boxSizing:'border-box',

                touchAction:'none',
                pointerEvents:'none',

                // alignItems:'center',
                // justifyContent:'center'
            }}>

        <Modal
            visible={!!tooltip}
            content={tooltip}
            />
        </div>
        )
}