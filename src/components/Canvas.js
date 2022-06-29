import { useDrag, usePinch, useWheel } from "@use-gesture/react";
import p5 from "p5";

import { useRef, useEffect } from "react";

import { sketch } from "../refactor/sketch";

import { settings, clip, flags } from "../refactor/globals";

export function CanvasContainer(props){

    const containerRef = useRef(null);


    usePinch( state => {

        const zf = state.movement[0];   //zoom factor

        settings.zoom.level = clip( settings.zoom.raw * zf, settings.zoom.min, settings.zoom.max);

        if(state.first){
            flags.pointerIgnore.raise();
        }

        //bake in new zoom level
        if(state.last){
            settings.zoom.raw = settings.zoom.level;
            flags.pointerIgnore.lower();
        }

    }, {target:containerRef, preventDefault: true});



    useWheel(state => {
        // state.event.preventDefault();

        //  zoom
        if(state.ctrlKey) return; // handled by usePinch instead (confirm on desktop w/ mouse?)

        

        //  scroll
        else{
            const sensitivity = 1;
            settings.scroll.x += state.delta[0] * sensitivity / settings.zoom.level;
            settings.scroll.y += state.delta[1] * sensitivity / settings.zoom.level;
        }
        
    }, {target: containerRef, eventOptions:{passive:false}, preventDefault: true});



    //move editing here
    useDrag(state => {

        const isScroll = !!(state.altKey || state.event.button === 1 || state.touches === 2);

        if(state.first){
            console.log(isScroll);
            //touch start
            if(isScroll)flags.pointerIgnore.raise();
            else flags.pointerDown.raise();
        }

        if(isScroll){
            //scroll instead of edit

            settings.scroll.x += state.delta[0] / settings.zoom.level;
            settings.scroll.y += state.delta[1] / settings.zoom.level;
        }
        else{
        }

        if(state.last){
            //touch end
            flags.pointerIgnore.lower();
            flags.pointerUp.raise();
        }   
        
    }, {target: containerRef});

    useEffect(()=>{
        
        const p5Instance = new p5(sketch, containerRef.current);

        return () => p5Instance.remove();
    })

    return (
        <div
            id='p5-container'
            ref={containerRef}


                ///////////////START cleanup v

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

                onPointerDown={evt=>{
                    evt.stopPropagation(); //  stop the event from bubbling up to parent pointerdown handler
                }}

                onTouchStart={e=>{
                    if(e.targetTouches > 1){
                        flags.pointerIgnore.raise()
                    }
                }}

                ////////////////END

            ></div>
    )
}