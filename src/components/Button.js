import { useTooltip } from '../hooks/useTooltip';

import { useEffect } from 'react';

import { display } from '../refactor/globals';

export function Button(props){

    const {
        tooltip = '',
        onClick,
        id,
        className = 'button',
        content,
    } = props;

    const {visible, handlers} = useTooltip(tooltip, 500, {onClick: onClick});

    useEffect(()=>{
        display.tooltip = visible ? tooltip : '';
        display.refresh?.()
    })

    return(
        <button
            
            {...handlers}


            data-tooltip={tooltip}
            id={id}
            className={className}

        >{content}</button>
    );
}