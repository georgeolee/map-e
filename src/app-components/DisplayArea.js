import { useEffect, useRef, useState } from "react";

import { sprintf } from "sprintf-js";
/**
 * Display area for showing angle info & tooltips
 * @param {*} props 
 * @returns 
 */
export function DisplayArea(props){

    const {
        id,
        className,
        displayData, //global display object
    } = props;

    const displayRef = useRef();

    
    const [state, setState] = useState();

    let angle = displayData.angle;

    if(typeof angle === 'number'){
        angle = Math.round(angle * 2) / 2;  // round to nearest 0.5 increment
        angle = sprintf('%.1fº', angle);    // format
    }

    //set the global display object's refresh function to trigger a rerender of this component
    useEffect(()=>{
        displayData.refresh = () => setState(!state);

        //for debugging on mobile
        displayData.error = (e, displayFreeze = true) => {
            const display = displayRef.current;
            
            if(!display) return;

            if(displayFreeze) displayData.refresh = null;            
            display.style.color = '#f00';
            display.textContent = typeof e === 'string' ? e : `${e.name}: ${e.message}`

            const normalDisplay = display.querySelector('.display-info');
            if(normalDisplay) normalDisplay.style.display = 'none';
        }
    })

    // useEffect
    return(
        <div
            id={id}
            className={'display-area' + (className ? ' ' + className : '')}
            ref={displayRef}
            >
                <div className="display-info">
                    <div className="display-angle">angle: {angle}</div>
                    <div className="display-size">{`size: ${displayData.size.x} x ${displayData.size.y}`}</div>
                </div>
                {/* <TooltipModal/> */}
        </div>
    )
}