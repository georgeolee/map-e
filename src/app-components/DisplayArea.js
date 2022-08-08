import { useEffect, useRef, useState } from "react";
import { TooltipModal } from "../components/TooltipModal";
import { settings } from "../refactor/globals";

/**
 * Display area for showing angle info & tooltips
 * @param {*} props 
 * @returns 
 */
export function DisplayArea(props){

    const {
        id,
        className,
        displayData,
    } = props;

    const displayRef = useRef();

    
    const [state, setState] = useState();

    //set the global display object's refresh function to trigger a rerender of this component
    useEffect(()=>{
        displayData.refresh = () => setState(!state);

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
                    <div className="display-angle">angle: {typeof displayData.angle === 'number' ? displayData.angle + 'º' : displayData.angle}</div>
                    <div className="display-size">{`size: ${displayData.size.x} x ${displayData.size.y}`}</div>
                </div>
                {/* <TooltipModal/> */}
        </div>
    )
}