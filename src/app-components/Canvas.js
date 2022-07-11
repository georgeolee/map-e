import { useGesture } from "@use-gesture/react";
import p5 from "p5";

import { useRef, useEffect } from "react";

import { sketch } from "../refactor/sketch";

import { settings, clip, p5Flags } from "../refactor/globals";
import { vc } from "../refactor/globals";


import { useSpring, useSpringRef } from "@react-spring/web";

export function CanvasContainer(props){

    const containerRef = useRef(null);

    let x, y;

    let pinchX, pinchY;

/*          TODO - REMEMBER THIS TIME
  __  __  ____  _    _  _____ ______           
 |  \/  |/ __ \| |  | |/ ____|  ____|          
 | \  / | |  | | |  | | (___ | |__             
 | |\/| | |  | | |  | |\___ \|  __|            
 | |  | | |__| | |__| |____) | |____           
 |_|  |_|\____/_\____/|_____/|______|          
 \ \        / / |             | |              
  \ \  /\  / /| |__   ___  ___| |              
   \ \/  \/ / | '_ \ / _ \/ _ \ |              
    \  /\  /  | | | |  __/  __/ |              
     \/  \/   |_| |_|\___|\___|_|  _ _         
                    (_) | (_)     (_) |        
  ___  ___ _ __  ___ _| |_ ___   ___| |_ _   _ 
 / __|/ _ \ '_ \/ __| | __| \ \ / / | __| | | |
 \__ \  __/ | | \__ \ | |_| |\ V /| | |_| |_| |
 |___/\___|_| |_|___/_|\__|_| \_/ |_|\__|\__, |
                                          __/ |
                                         |___/  
  */


    //TEST---------------------------
    const springRef = useSpringRef()

    let frameRequest = 0;

    const anim = useSpring({
        ref: springRef,
        matrix: vc.getTransformMatrix(),
        inverseMatrix: vc.getInverseTransformMatrix(),
        config: {
            friction: 10,
            tension: 400,
            mass:0.21,
        },
    })

    const queueMatrixAnimation = () => {
        const m = vc.getTransformMatrix();
        const i = vc.getInverseTransformMatrix();
        const controller = springRef.current[0];

        //push new animation targets to queue
        controller.update({matrix:m, inverseMatrix:i});
    }


    const updateVCAnim = () => {
        
        //get animated matrix values
        vc.animated.matrix = anim.matrix.get();
        vc.animated.inverseMatrix = anim.inverseMatrix.get();

        //no pending animations - end update loop
        if(springRef.current[0].idle && !springRef.current[0].queue.length){
            frameRequest = 0;
            return;
        }

        // if(frameRequest) window.cancelAnimationFrame(frameRequest)
        frameRequest = window.requestAnimationFrame(updateVCAnim)
    }

    //call immediately after any matrix change
    const handleVCTransformation = () => {

        const controller = springRef.current[0];

        controller.stop()
        queueMatrixAnimation();
        if(controller.idle) controller.start();
        
        //start update loop if it isn't running 
        if(!frameRequest) frameRequest = window.requestAnimationFrame(updateVCAnim);
    };

    //attach a callback to VC for stopping any ongoing animation when resetting transform; probably a cleaner way to do this
    useEffect(()=>{
        vc.animated.stop = () => {
            springRef.current[0].stop(); 
            if(frameRequest){
                window.cancelAnimationFrame(frameRequest);
                frameRequest = 0;
            }
        };
    })
    //----------------------------------------


    useGesture({

        //pinch
        onPinchStart: state => {
            p5Flags.pointerIgnore.raise();

            //convert client coords to canvas coords
            const [clientX, clientY] = state.origin;            
            const rect = containerRef.current.getBoundingClientRect();

            //save pinch origin
            ({x:pinchX, y:pinchY} = vc.getWorldToLocalPoint(clientX - rect.left, clientY - rect.top));
            vc.startPinch();            
            
        },
        onPinch: state => {
            //clamp scale between min & max settings
            const currentCanvasScale = vc.getScale(false);
            const zf = clip(state.movement[0], settings.zoom.min / currentCanvasScale, settings.zoom.max / currentCanvasScale);
            
            vc.scaleFromPoint(zf, pinchX, pinchY);

            handleVCTransformation();
        },
        onPinchEnd: state => {
            p5Flags.pointerIgnore.lower();
            vc.endPinch();
        },

        //wheel
        onWheel: state => {
            if(state.pinching) return;
            const scale = vc.getScale(false);
            vc.translate(state.delta[0] / scale, state.delta[1] / scale);
            
            handleVCTransformation();
            return state.elapsedTime;
        },

        //drag
        onDragStart: state => {
            const isPan = !!(state.altKey || state.event.button === 1 || state.touches === 2);
            if(isPan) p5Flags.pointerIgnore.raise();
            else p5Flags.pointerDown.raise();
        },        
        onDrag: state => {
            const isPan = state.altKey || state.event?.button === 1 || state.touches === 2;
            
            //handle pan gesture
            if(isPan){

                //touch screen 2 finger swipe
                if(state.event.changedTouches?.length === 2){
                    let [dx, dy] = [0, 0];


                    for(let i = 0; i < state.event.changedTouches.length; i++){

                        //get touch point
                        const t = state.event.changedTouches.item(i);

                        //get cached values for same point, if available
                        const cached = state.memo?.[t.identifier];

                        dx += t.clientX - (cached?.clientX || t.clientX);
                        dy += t.clientY - (cached?.clientY || t.clientY);                                             
                    }

                    dx /= state.event.changedTouches.length;
                    dy /= state.event.changedTouches.length;

                    const scale = vc.getScale(false);
                    vc.translate(dx / scale, dy / scale);
                    
                    //TEST
                    handleVCTransformation();
                    
                    //cache touch points from this drag event
                    const tp = {};                    
                    for(let i = 0; i < state.event.changedTouches.length; i++){
                        const t = state.event.targetTouches.item(i);
                        tp[t.identifier] = {
                            clientX:t.clientX, 
                            clientY:t.clientY
                        }
                    }

                    //and store in state.memo for the next event cycle
                    return tp;
                }

                //other pan gesture - wheel or alt click drag
                const scale = vc.getScale(false);
                vc.translate(state.delta[0] / scale, state.delta[1] / scale);

                //TEST
                handleVCTransformation();
            }
        },
        onDragEnd: state => {
            p5Flags.pointerIgnore.lower();
            p5Flags.pointerUp.raise();
        },

    }, {
        //gesture config - global
        target: containerRef,
        
        //gesture config
        wheel: {            
            eventOptions:{
                passive:false,        
            },
            preventDefault: true,            
        },
        
        pinch: {          
            eventOptions:{
                passive:false,        
            },
            preventDefault: true,
        },

        drag: {
            pointer:{
                touch:true,
            },
        }
    })

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
                        if(e.pointerType === 'mouse' && p5Flags.isTouch.isRaised){
                            p5Flags.isTouch.lower();
                        }
                                                                    
                        else if(e.pointerType !== 'mouse' && !p5Flags.isTouch.isRaised){
                            p5Flags.isTouch.raise();
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
                        p5Flags.pointerIgnore.raise()
                    }
                }}


            ></div>
    )
}