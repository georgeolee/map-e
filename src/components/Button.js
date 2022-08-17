import { useTooltip } from '../hooks/useTooltip';

export function Button(props){

    const {
        tooltip = '',
        onClick,
        id,
        className = 'button',
        content,
    } = props;

    const {visible, handlers} = useTooltip(tooltip, 1200, {onClick: onClick});


    return(
        <button
            
            {...handlers}


            data-tooltip={tooltip}
            id={id}
            className={className}

        >{content}</button>
    );
}