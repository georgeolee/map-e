import { useState, useRef } from "react";
import { display } from "../refactor/globals";

import { useLongPress } from "./useLongPress";

/**
 * 
 * @param {Number} showDelay 
 * @param {{}} handlers 
 * @returns 
 */
export function useTooltip(tooltip = 'a tooltip!', showDelay = 500, handlers = {}){
    
    // if the component uses any of these handlers, pass them in so they can be incorporated into the event handlers returned by this hook
    const {
        onClick: component_onClick,
        onPointerEnter: component_onPointerEnter,
        onPointerLeave: component_onPointerLeave,
        onPointerDown: component_onPointerDown,
        onPointerUp: component_onPointerUp,
    } = handlers;


    //filter onClick through longTouch hook so that long press triggers tooltip visibility instead
    const {handlers: long_touch_handlers} = useLongPress(showDelay, {
        
        //normal onClick handling for mouse & short touch
        onMouseClick: component_onClick,
        onMouseLongClick: component_onClick,
        onTouchClick: component_onClick,


        onTouchLongPress: () => startShowTimer(0),  //  delay here is handled by useLongPress first arg, so just use 0 for startShowTimer
    })

    const [visible, setTooltipVisible] = useState(false);
    
    const showTimerRef = useRef();



    function showTooltip(){
        // console.log(`showing tooltip`)

        display.setTooltip?.(tooltip)

        setTooltipVisible(true);
    }

    function hideTooltip(){

        if(!visible) return; //already hidden

        // console.log(`tooltip hidden`)

        display.setTooltip?.('')
        
        setTooltipVisible(false);
    }

    function startShowTimer(delay){
        clearShowTimer();
        showTimerRef.current = setTimeout(()=>{
            showTooltip();
        }, delay);
    }

    function clearShowTimer(){
        clearTimeout(showTimerRef.current);
    }

    function handleOnPointerEnter(e){
        
        //call component handler if one was provided
        component_onPointerEnter?.(e);

        //no hover behavior for touch input ; use long touch instead
        if(e.pointerType === 'touch'  || e.pointerType === 'pen') return;

        //
        startShowTimer(showDelay);
    }

    function handleOnPointerLeave(e){

        component_onPointerLeave?.(e);

        clearShowTimer();
        hideTooltip();
    }



    //add long touch logic to pointerDown, pointerUp, onClick handlers

    function handleOnPointerDown(e){

        component_onPointerDown?.(e);

        //LT handler for showing tooltip on long touch
        long_touch_handlers.onPointerDown(e);
        
        //hide tooltip (if showing) & clear show timer (if not showing yet) on mouse down
        if(e.pointerType === 'mouse'){
            hideTooltip();
            clearShowTimer();
        }
    }

    function handleOnPointerUp(e){

        component_onPointerUp?. (e);

        long_touch_handlers.onPointerUp(e);
        hideTooltip();
    }

    function handleOnClick(e){
        long_touch_handlers.onClick(e);
    }

    //return tooltip visibility (boolean) and new event handlers that incorporate the tooltip logic
    return {
        visible,
        handlers:{
            onClick: handleOnClick,
            onPointerEnter: handleOnPointerEnter,
            onPointerLeave: handleOnPointerLeave,
            onPointerDown: handleOnPointerDown,
            onPointerUp: handleOnPointerUp,
        }
    };
}