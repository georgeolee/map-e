import * as tooltipHandler from '../tooltips'

export function Button(props){
    const {
        tooltip = '',
        onClick,
        id,
        className,
        content,
    } = props;

    return(
        <button
            onClick={onClick}
            data-tooltip={tooltip}
            id={id}
            className={className}

            onPointerEnter={tooltipHandler.pointerEnter}
            onTouchStart={tooltipHandler.touchStart}
            onPointerLeave={tooltipHandler.pointerLeave}
            onTouchEnd={tooltipHandler.touchEnd}
            
        >{content}</button>
    );
}