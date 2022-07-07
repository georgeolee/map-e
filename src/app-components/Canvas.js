import { useDrag, usePinch, useWheel } from "@use-gesture/react";
import p5 from "p5";

import { useRef, useEffect } from "react";

import { sketch } from "../refactor/sketch";

import { settings, clip, flags } from "../refactor/globals";
import { vc } from "../refactor/globals";

export function CanvasContainer(props){

    const containerRef = useRef(null);


    usePinch( state => {

        const zf = state.movement[0];   //zoom factor

        // settings.zoom.level = clip( settings.zoom.raw * zf, settings.zoom.min, settings.zoom.max);

        //ignore pointer while zooming
        if(state.first){
            flags.pointerIgnore.raise();

            //test
            vc.startPinch();
        }

        //some way to clip?
        vc.scaleFromPoint(zf, state.origin[0], state.origin[1])

        //bake in new zoom level
        if(state.last){
            // settings.zoom.raw = settings.zoom.level;
            flags.pointerIgnore.lower();
            
            //test
            vc.endPinch();
        }

    }, {target:containerRef, preventDefault: true});



    useWheel(state => {

        //  zoom    –>  handled by usePinch instead (confirm on desktop w/ mouse?)
        if(state.ctrlKey) return; 

        

        //  scroll
        else{
            //test
            const scale = vc.getScale();
            vc.translate(state.delta[0] / scale, state.delta[1] / scale)
        }
        
    }, {target: containerRef, eventOptions:{passive:false}, preventDefault: true});



    //move editing here
    useDrag(state => {

        //scrolling? check for: alt-click or middle-click or 2-finger drag
        const isScroll = !!(state.altKey || state.event.button === 1 || state.touches === 2);

        //touch start
        if(state.first){            
            if(isScroll)flags.pointerIgnore.raise();    //scrolling; tell p5 to ignore pointer down/hover/etc
            else flags.pointerDown.raise();             //not scrolling; tell p5 pointer is down
        }

        //touch end
        else if(state.last){            
            flags.pointerIgnore.lower();
            flags.pointerUp.raise();
        }


        //if scrolling
        if(isScroll){                        
            const scale = vc.getScale();
            vc.translate(state.delta[0] / scale, state.delta[1] / scale)
        }  
        //else –> edit; handled inside sketch.js   
        
    }, {target: containerRef});

    //create p5 canvas running sketch.js
    useEffect(()=>{
        const p5Instance = new p5(sketch, containerRef.current);
        return () => p5Instance.remove();
    })

    useEffect(()=>{
        console.log('canvas render');
    })

    return (
        <div
            id='p5-container'
            ref={containerRef}


                //detect touch vs mouse input
                onPointerDownCapture={
                    e =>{
                        if(e.pointerType === 'mouse' && flags.isTouch.isRaised){
                            flags.isTouch.lower();
                        }
                                                                    
                        else if(e.pointerType !== 'mouse' && !flags.isTouch.isRaised){
                            flags.isTouch.raise();
                        }
                    }
                }

                // stop pointer down events from bubbling up to parent pointerdown handler
                // (App has its own handler to raise pointerIgnore flag; don't want it to fire if evt target is canvas)
                onPointerDown={evt=>{
                    evt.stopPropagation(); 
                }}

                //prevent unintentional editing inside of sketch.js if multiple touch points are registered
                onTouchStart={e=>{
                    if(e.targetTouches > 1){
                        flags.pointerIgnore.raise()
                    }
                }}


            ></div>
    )
}