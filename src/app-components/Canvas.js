import { useDrag, usePinch, useWheel } from "@use-gesture/react";
import p5 from "p5";

import { useRef, useEffect } from "react";

import { sketch } from "../refactor/sketch";

import { settings, clip, flags } from "../refactor/globals";
import { vc } from "../refactor/globals";

import { display } from "../refactor/globals";

export function CanvasContainer(props){

    const containerRef = useRef(null);

    const pinchRef = useRef(null);

    const timeoutRef = useRef(null);

    let x, y;

    

    //fixed - pinch origin weirdness - was forgetting to convert origin coords from client to element based before applying transformation

    //TODO - pinch works on desktop ; figure out what's causing weirdness on mobile
            //  - related in any way to translation wonkiness?
            //  - thought - mobile can fire drag & pinch at same time ; desktop is locked into one or other
            //  - am i missing / fumbling a coordinate space conversion somewhere?

    usePinch( state => {

        pinchRef.current = state;

        // state.d
        // console.log(state.delta)

        const zf = state.movement[0];   //zoom factor

        // settings.zoom.level = clip( settings.zoom.raw * zf, settings.zoom.min, settings.zoom.max);

        //ignore pointer while zooming
        if(state.first){
            flags.pointerIgnore.raise();

            // const t = state.event.currentTarget;
            // console.log(t);
            

            //gesture origin is in client coordinates
            const [clientX, clientY] = state.origin;

            //get client rect to get gesture coordinates relative to canvas
            const rect = containerRef.current.getBoundingClientRect();

            ({x, y} = vc.getWorldToLocalPoint(clientX - rect.left, clientY - rect.top));
                        
            
        }

        if(!vc.pinching) vc.startPinch();

        const format = (n, length = 6) => {
            const k = Math.round(n * 100) / 100;
            let str = k.toString();
            for(let i = str.length; i < length; i++){
                str = ' ' + str;
            }
            return str;
        }
        //TESTING
        // display.tooltip = `origin: ${format(state.origin[0])},\t${format(state.origin[1])}`;
        display.tooltip = `scale from: x: ${format(x)},\ty: ${format(y)},\tscale factor: ${format(zf)}`;
        display?.refresh()

        //some way to clip?
        
        // vc.scaleFromPoint(zf, state.origin[0], state.origin[1])

        // ({x, y} = vc.getWorldToLocalPoint(...state.origin))

        // console.log(`origin: ${state.origin}`);
        // console.log(state.origin);
        // console.log('client: ',state.event.clientX, state.event.clientY)
        // console.log(`element: ${state.event.clientX - state.event.target.getBoundingClientRect().left}\t${state.event.clientY - state.event.target.getBoundingClientRect().top}`);
        
        vc.scaleFromPoint(zf, x, y);

        //bake in new zoom level
        if(state.last){
            // settings.zoom.raw = settings.zoom.level;
            flags.pointerIgnore.lower();
            
            //test
            vc.endPinch();
            pinchRef.current = null;
        }

    }, {target:containerRef, preventDefault: true});



    useWheel(state => {

        //  zoom    –>  handled by usePinch instead (confirm on desktop w/ mouse?)
        if(state.ctrlKey) return; 

        

        //  scroll
        else{
            //test
            const scale = vc.getScale(false);
            vc.translate(state.delta[0] / scale, state.delta[1] / scale);
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
            
            // const pinchThreshold = 0.01;
            // if(pinchRef.current?.delta[0] > pinchThreshold) return;

            const d = document.querySelector('.display-area');
            if(timeoutRef.current){
                clearTimeout(timeoutRef.current);
            }

            const color = state.delta[1] < 0 ? '#fe8' : '#8ef'

            d.style.backgroundColor = color;
            timeoutRef.current = setTimeout(()=> d.style.backgroundColor = 'var(--white)',200)

            
            const scale = vc.getScale(false);            
            

            // if(vc.pinching) vc.endPinch();

            // pinchRef.current?.cancel()

            vc.translate(state.delta[0] / scale, state.delta[1] / scale)
        }  
        //else –> edit; handled inside sketch.js   
        
    }, {target: containerRef, pointer:{touch:true}});

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