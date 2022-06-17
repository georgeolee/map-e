import { useEffect, useRef } from "react";

export function RadioHeader(props){
    const {
        label = 'Radio Group',
        tooltip } = props;

    return(
        <div className="radio radio-header" data-tooltip={tooltip}>
            {label}
        </div>
    );
}

export function Radio(props){

    const inputRef = useRef();  

    const {
        name = 'radio-group-default', 
        label = 'radio-option-default', 
        func = () => console.log('checked ' + label), 
        checked = false, 
        init = true,
        tooltip,
        className } = props;

    useEffect(()=>{
        inputRef.current.checked = !!checked;        
        if(init && checked) func?.();
    },
    [init, func, checked])

    return(
        <div className={'radio radio-item' + (className ? ' ' + className : '')}>
            <input 
                className="radio-input" 
                type="radio" ref={inputRef} 
                name={name} 
                onChange={e => {if(e.target.checked) func?.()}}
                data-tooltip={tooltip}
            />
            <div className="radio-label">
                {label}
            </div>
        </div>
    );
}