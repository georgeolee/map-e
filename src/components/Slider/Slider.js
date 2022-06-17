import {useEffect, useRef} from 'react';
import './Slider.css';

export function Slider(props){
    const inputRef = useRef();
    
    const {
        min = 0,
        max = 1,
        step = 0.01,
        defaultValue = (min + max) / 2,
        func = null,
        init = true,
        id,
        className,
        // tooltip,
    } = props;
    
    const setProgressPercentCSS = () => {
        const el = inputRef.current;     


        const normalizedValue = (Number(el.value) - el.min) / (el.max - el.min);

        const style = getComputedStyle(el);
        const thumbWidth = Number(style.getPropertyValue('--slider-thumb-width').replace('px',''));
        const sliderWidth = Number(style.getPropertyValue('width').replace('px', ''));

        
        //keeps the gradient visually in the center of the thumb
        const offset = (thumbWidth / sliderWidth) * (normalizedValue - 0.5)

        const percent =  `${100 * (normalizedValue - offset)}%`;

        el.style.setProperty('--slider-progress-percent', percent)
    }

    const onChange = (e) => {
        setProgressPercentCSS();
        func?.(Number(e.target.value));
    }    

    useEffect(()=>{        
        setProgressPercentCSS();
        if(init) func?.(Number(inputRef.current.value));
    });

    return(      
            <input 
                type="range" 
                className={'slider' + (className ? ' ' + className : '')}
                id={id}
                ref={inputRef} 
                onChange={onChange} 
                defaultValue={defaultValue} 
                min={min} 
                max={max} 
                step={step}
                // data-tooltip={tooltip}
            />
    );
}