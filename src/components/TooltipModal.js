import { useState, useEffect } from "react";
import { display } from "../refactor/globals";
import { Tooltip } from "./Tooltip";

export function TooltipModal(props){

    const [tooltip, setTooltip] = useState('');


    useEffect(()=>{
        display.setTooltip = t => setTooltip(t);
    })

    return (

        <div
            id='tooltip-modal-wrapper'

            style={{
                position: 'relative',
                display:'flex',
                maxHeight:'100px',

                boxSizing:'border-box',

                touchAction:'none',
                pointerEvents:'none',

            }}>

        <Tooltip
            visible={!!tooltip}
            content={tooltip}
            />
        </div>
        )
}