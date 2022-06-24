
import { display } from "./refactor/globals";

const tooltipAttribute = 'data-tooltip'



let showTimeout, hideTimeout;

let showDelay = 100;
let hideDelay = 100;


const showDelayTouch = 500;
const hideDelayTouch = 500;

function showTooltip(e, delay){    

    const text = getTooltip(e)

    clearTimeout(showTimeout);

    showTimeout = setTimeout(()=>{
        clearTimeout(hideTimeout);
        display.tooltip = text;
        display?.refresh();
    }, delay);

}

function hideTooltip(delay){
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);    

    hideTimeout = setTimeout(()=>{
        display.tooltip = '';
        display?.refresh();
    }, delay)    
}

const getTooltip = e => e.target.getAttribute(tooltipAttribute);

// export let tooltip = '';

export function pointerEnter(e){
    showTooltip(e, showDelay)
}

export function pointerLeave(e){
    hideTooltip(hideDelay)
}

export function touchStart(e){
    [showDelay, hideDelay] = [showDelayTouch, hideDelayTouch]
    showTooltip(e, showDelay)
}

export function touchEnd(e){
    
    //still registering at least one touch on target
    if(e.targetTouches > 0) return;

    hideTooltip(hideDelay)
}