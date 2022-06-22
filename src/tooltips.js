const tooltipAttribute = 'data-tooltip'

function showTooltip(e){
    console.log(`show: ${getTooltip(e)}`)
}

function hideTooltip(){
    console.log('hide')
}

const getTooltip = e => e.target.getAttribute(tooltipAttribute);

// export let tooltip = '';

export function pointerEnter(e){
    console.log('pointer enter');
    showTooltip(e)
}

export function pointerLeave(e){
    console.log('pointer leave');
    hideTooltip()
}

export function touchStart(e){
    console.log('touch start')
    showTooltip(e)
}

export function touchEnd(e){
    
    //still registering at least one touch on target
    if(e.targetTouches > 0) return;

    console.log('touch end')
    hideTooltip()
}