import { useEffect, useRef } from "react";

export function Checkbox(props){

    const inputRef = useRef();

    const {
        checked = false,
        label = 'Checkbox',
        init = true,
        func = b => console.log(`checkbox value: ${b}`),
        tooltip,
    } = props;

    const onChange = e => func(e.target.checked);

    useEffect(()=>{
        inputRef.current.checked = checked;
        if(init) func(inputRef.current.checked)
    })

    return(
        <div className="checkbox">            
            <input type="checkbox" ref={inputRef} onChange={onChange} data-tooltip={tooltip}/>
            <div className="checkbox-label">{label}</div>
        </div>
    );
}