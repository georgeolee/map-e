import * as tooltipHandler from "../tooltips";

export function FileInput(props){

    const {
        accept = '.png',
        func = url => console.log(`url: ${url}`),
        tooltip,
        className,
        id,
    } = props;
    

    const onChange = e => {
        if(!e.target.files[0]) return;
        const url = URL.createObjectURL(e.target.files[0]);
        func(url)
    }

    return(
        <div className={'file-input app-button' + (className ? ' ' + className : '')} id={id}>   
            <button 
                className="file-input-button" 
                onClick={e => e.target.nextElementSibling?.click()} 
                data-tooltip={tooltip}

                onPointerEnter={tooltipHandler.pointerEnter}
                onTouchStart={tooltipHandler.touchStart}
                onPointerLeave={tooltipHandler.pointerLeave}
                onTouchEnd={tooltipHandler.touchEnd}
                />                        
            <input 
                type="file" 
                accept={accept} 
                className='file-input-button' 
                onChange={onChange}
                />
        </div>
    );
}