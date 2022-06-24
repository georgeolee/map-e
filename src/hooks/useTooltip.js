import { useState, useRef } from "react";

import { useLongPress } from "./useLongPress";

export function useTooltip(showDelay = 1000, listeners = {}){
    
    const {
        onClick,    //onClick listener passed in from parent function
    } = listeners;


    //filter onClick through longTouch hook so that long press shows tooltip instead
    const {handlers: long_touch_handlers} = useLongPress(showDelay, {
        
        //normal click handling 
        onMouseClick: onClick,
        onMouseLongClick: onClick,
        onTouchClick: onClick,
        onTouchLongPress: () => startShowTimer(0),
    })

    const [visible, setTooltipVisible] = useState(false);
    
    const showTimerRef = useRef();



    function showTooltip(){
        console.log(`showing tooltip`)

        setTooltipVisible(true);
    }

    function hideTooltip(){

        if(!visible) return; //already hidden

        console.log(`tooltip hidden`)

        setTooltipVisible(false);
    }

    function startShowTimer(delay){
        clearShowTimer();
        showTimerRef.current = startTimeout(()=>{
            showTooltip();
        }, delay);
    }

    function clearShowTimer(){
        clearTimeout(showTimerRef.current);
    }

    function handleOnPointerEnter(e){
        if(e.pointerType === 'touch'  || e.pointerType === 'pen') return;
        startShowTimer(showDelay);
    }

    function handleOnPointerLeave(e){
        hideTooltip();
    }

    function handleOnPointerDown(e){
        long_touch_handlers.onPointerDown(e);
        
        //hide tooltip on mouse down
        if(e.pointerType !== 'touch' || e.pointerType === 'pen'){
            hideTooltip();
        }
    }

    function handleOnPointerUp(e){
        long_touch_handlers.onPointerUp(e);
        hideTooltip();
    }

    function handleOnClick(e){

        //use the filtered onClick listener returned by longTouch hook
        long_touch_handlers.onClick(e);
    }

    return {
        visible,
        handlers:{
            onClick: handleOnClick,
            onPointerEnter: handleOnPointerEnter,


            //finish adding ...

            //return event handlers for the parent component to use
        }
    };
}