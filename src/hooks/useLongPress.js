
import { useRef, useState } from "react";

/**
 * 
 * @param {Number} longPressTime - milliseconds required to trigger a long press/click
 * @param {{}} listeners - an object with one or more of the following event handlers defined as properties: \
 * – onClick, onLongClick, onLongPress\
 * – onMouseClick, onMouseLongClick, onMouseLongPress\
 * – onTouchClick, onTouchLongClick, onTouchLongPress
 * @returns \{action, inputType, handlers : {}}
 */
export function useLongPress(longPressTime = 500, listeners = {}){

    if(typeof longPressTime !== 'number'){
        throw new Error(`useLongPress(): argument must be a number; received ${typeof longPressTime}`);
    }

    const [action, setAction] = useState();

    
    const {
        //generic pointer listeners
        onClick, 
        onLongClick, 
        onLongPress,
    
        //mouse specific
        onMouseClick,
        onMouseLongClick,
        onMouseLongPress,

        //touch specific
        onTouchClick,
        onTouchLongClick,
        onTouchLongPress

    } = listeners;    


    const timerRef = useRef();

    const isLongPress = useRef();

    const inputType = useRef();


    function startPressTimer(e){
        //console.log('\t\tpress startedd');
        isLongPress.current = false;
        clearPressTimer();
        timerRef.current = setTimeout(()=>{
            isLongPress.current = true;         
            
            onLongPress?.(e)
            if(inputType.current === 'mouse') onMouseLongPress?.();
            if(inputType.current === 'touch' || inputType.current === 'pen') onTouchLongPress?.();

            //console.log(`\t\tset action type to longpress`);
            
            setAction('longpress');
        }, longPressTime);
    }

    function clearPressTimer(){
        clearTimeout(timerRef.current);
    }


    // handlers

    function handleOnPointerDown(e){
        inputType.current = e.pointerType;
        startPressTimer(e);
    }

    function handleOnPointerUp(){
        clearPressTimer();
    }

    function handleOnClick(e){
        if(isLongPress.current){
            //console.log(`long press - ${inputType.current}`);
            
            onLongClick?.(e);
            if(inputType.current === 'mouse') onMouseLongClick?.(e);
            if(inputType.current === 'touch' || inputType.current === 'pen') onTouchLongClick?.(e);

            return; //is a long press / click ; don't fire regular click action
        }
        //console.log(`click - ${inputType.current}`);
        //console.log(`\t\tset action type to click`);

        
        onClick?.(e);
        if(inputType.current === 'mouse') onMouseClick?.(e);
        if(inputType.current === 'touch' || inputType.current === 'pen') onTouchClick?.(e);

        setAction('click');
    }


    return {
        action,
        inputType: inputType.current,
        handlers: {

            onPointerUp: handleOnPointerUp,
            onPointerDown: handleOnPointerDown,

            onClick: handleOnClick,
        }
    }
}