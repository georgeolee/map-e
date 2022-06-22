import { useEffect, useRef, useState } from "react";

export function DisplayArea(props){

    const {
        id,
        className,
        displayData,
    } = props;

    const displayRef = useRef();

    const [state, setState] = useState();

    useEffect(()=>{
        displayData.refresh = () => setState(!state);
    })

    // useEffect
    return(
        <div
            id={id}
            className={'display-area' + (className ? ' ' + className : '')}
            ref={displayRef}
            >
                <ul className="display-info">
                    <li className="display-angle">angle: {displayData.angle}</li>
                    <li className="display-tooltip">{displayData.tooltip}</li>
                </ul>                        
        </div>
    )
}