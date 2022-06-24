import * as tooltipHandler from '../tooltips'

import { useLongPress } from '../hooks/useLongPress';
import { useEffect } from 'react';

export function Button(props){

    const {
        tooltip = '',
        onClick,
        id,
        className,
        content,
    } = props;

    const {handlers} = useLongPress(500, {onClick: onClick});
    
    // useEffect(()=> console.log('render'))

    return(
        <button
            
            {...handlers}


            data-tooltip={tooltip}
            id={id}
            className={className}

            onPointerEnter={()=>console.log('enter')}
            onPointerLeave={()=>console.log('leave')}
            // onPointerEnter={tooltipHandler.pointerEnter}
            onTouchStart={tooltipHandler.touchStart}
            // onPointerLeave={tooltipHandler.pointerLeave}
            onTouchEnd={tooltipHandler.touchEnd}
            
        >{content}</button>
    );
}