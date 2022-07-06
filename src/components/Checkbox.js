import { useEffect, useRef } from "react";

import { useTooltip } from "../hooks/useTooltip";

import { display } from "../refactor/globals";

export function Checkbox(props){

    const {showTooltip, handlers} = useTooltip(400, {onLongPress: ()=>console.log('LP')});

    const inputRef = useRef();

    const {
        checked = false,
        label = 'Checkbox',
        init = true,
        func = b => console.log(`checkbox value: ${b}`),
        tooltip,
    } = props;

    const onChange = e => {if(!showTooltip)func(e.target.checked)};

    useEffect(()=>{
        display.tooltip = showTooltip ? tooltip : '';
        display.refresh?.()
    })

    // useEffect(()=>{
    //     inputRef.current.checked = checked;
    //     if(init) func(inputRef.current.checked)
    // })

    return(
        <div className="checkbox">            
            <input 
                {...handlers}
                type="checkbox"                 
                ref={inputRef} 
                onChange={onChange} 
                defaultChecked={checked}
                data-tooltip={tooltip}/>
                
            <div className="checkbox-label">{label}</div>
        </div>
    );
}