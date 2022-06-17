export function LinkButton(props){
    const{
        id,
        className,
        href,
        label,
        target = '_blank',
        tooltip,
    } = props;

    return(
        <div className={'link-button app-button' + (className ? ' ' + className : '')} id={id}>
            <label>
                <button onClick={e => e.target.parentElement.nextElementSibling?.click()} data-tooltip={tooltip}/>
                {label}
            </label>
            <a href={href} target={target}>{label}</a>
        </div>
    );
}