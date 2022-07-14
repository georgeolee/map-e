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
    
    // if the component uses any of these handlers, pass them in so they can be added to the new handlers returned by this hook
    const {
        onClick: parent_onClick,
        onPointerEnter: parent_onPointerEnter,
        onPointerLeave: parent_onPointerLeave,
        onPointerDown: parent_onPointerDown,
        onPointerUp: parent_onPointerUp,
    } = handlers;


    //filter onClick through longTouch hook so that long press triggers tooltip visibility instead
    const {handlers: long_touch_handlers} = useLongPress(showDelay, {
        
        //normal onClick handling for mouse & short touch
        onMouseClick: parent_onClick,
        onMouseLongClick: parent_onClick,
        onTouchClick: parent_onClick,


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
        
        //call parent handler if one was provided
        parent_onPointerEnter?.(e);

        //no hover behavior for touch input ; use long touch instead
        if(e.pointerType === 'touch'  || e.pointerType === 'pen') return;

        //
        startShowTimer(showDelay);
    }

    function handleOnPointerLeave(e){

        parent_onPointerLeave?.(e);

        clearShowTimer();
        hideTooltip();
    }



    //add long touch logic to pointerDown, pointerUp, onClick handlers

    function handleOnPointerDown(e){

        parent_onPointerDown?.(e);

        //LT handler for showing tooltip on long touch
        long_touch_handlers.onPointerDown(e);
        
        //hide tooltip on mouse down
        if(e.pointerType === 'mouse'){
            hideTooltip();
        }
    }

    function handleOnPointerUp(e){

        parent_onPointerUp?. (e);

        long_touch_handlers.onPointerUp(e);
        hideTooltip();
    }

    function handleOnClick(e){
        long_touch_handlers.onClick(e);
    }

    //return tooltip visibility and new event handlers that incorporate the tooltip logic
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