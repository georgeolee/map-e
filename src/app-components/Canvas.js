import { useGesture } from "@use-gesture/react";
import p5 from "p5";

import { useRef, useEffect } from "react";

import { sketch } from "../refactor/sketch";

import { settings, clip, flags } from "../refactor/globals";
import { vc } from "../refactor/globals";

import { display } from "../refactor/globals";

import { useSpring, useSpringRef, config } from "@react-spring/web";

export function CanvasContainer(props){

    const containerRef = useRef(null);

    let x, y;


    //TEST---------------------------
    const springRef = useSpringRef()

    let frameRequest = 0;

    const anim = useSpring({
        ref: springRef,
        matrix: vc.getTransformMatrix(),
        inverseMatrix: vc.getInverseTransformMatrix(),
        config: {
            friction: 170,
            tension: 2000,
            mass: 1
        },
    })

    const queueMatrixAnimation = () => {
        //check if this destructuring is necessary - eliminate if not
        const m = [...vc.getTransformMatrix()];
        const i = [...vc.getInverseTransformMatrix()];
        const controller = springRef.current[0];
        controller.update({matrix:m, inverseMatrix:i});
    }

    const processSpringQueue = async () => {
        const controller = springRef.current[0];
        if(!controller.queue.length || !controller.idle) return;
        await controller.start();
        processSpringQueue();
    }

    const updateVCAnim = () => {
        // frameRequest = 0;
        
        vc.animated.matrix = anim.matrix.get();
        vc.animated.inverseMatrix = anim.matrix.get();
        // if(frameRequest || springRef.current[0].idle) return;
        frameRequest = window.requestAnimationFrame(updateVCAnim)
    }

    //call immediately after any matrix change
    const handleVCTransformation = () => {
        springRef.current[0].stop()
        queueMatrixAnimation();
        processSpringQueue();
        if(frameRequest) window.cancelAnimationFrame(frameRequest);
        frameRequest = window.requestAnimationFrame(updateVCAnim);
    };

    //----------------------------------------

    //fixed - pinch origin weirdness - was forgetting to convert origin coords from client to element based before applying transformation

    //TODO - pinch works on desktop ; figure out what's causing weirdness on mobile
            //  - related in any way to translation wonkiness?
            //  - thought - mobile can fire drag & pinch at same time ; desktop is locked into one or other
            //  - am i missing / fumbling a coordinate space conversion somewhere?

    //continue - get 


    useGesture({
        //handlers

        //pinch
        onPinchStart: state => {
            flags.pointerIgnore.raise();
            //convert client coords to canvas coords
            const [clientX, clientY] = state.origin;            
            const rect = containerRef.current.getBoundingClientRect();

            //save pinch origin
            ({x, y} = vc.getWorldToLocalPoint(clientX - rect.left, clientY - rect.top));
            vc.startPinch();            
            
        },
        onPinch: state => {
            const zf = state.movement[0];
            vc.scaleFromPoint(zf, x, y);

            //TEST
            handleVCTransformation();
        },
        onPinchEnd: state => {
            flags.pointerIgnore.lower();
            vc.endPinch();
        },

        //wheel
        onWheel: state => {
            if(state.pinching) return;
            const scale = vc.getScale(false);
            vc.translate(state.delta[0] / scale, state.delta[1] / scale);
            
            //TEST
            handleVCTransformation();
            return state.elapsedTime;
        },

        //drag
        onDragStart: state => {
            const isPan = !!(state.altKey || state.event.button === 1 || state.touches === 2);
            if(isPan) flags.pointerIgnore.raise();
            else flags.pointerDown.raise();
        },        
        onDrag: state => {
            const isPan = state.altKey || state.event?.button === 1 || state.touches === 2;
            
            //handle pan gesture
            if(isPan){

                if(state.event.changedTouches?.length === 2){
                    let [dx, dy] = [0, 0];


                    /*
                    *   issue - oversensitive scrolling
                    *
                    *   cause - (probably?) - getting summed delta from touch points -> if 2 points travel same direction across screen, distance will be doubled
                    * 
                    *   try - average out delta?
                    * 
                    * 
                    * 
                    * 
                    * 
                    */


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
                const scale = vc.getScale(false);
                vc.translate(state.delta[0] / scale, state.delta[1] / scale);

                //TEST
                handleVCTransformation();
            }
        },
        onDragEnd: state => {
            flags.pointerIgnore.lower();
            flags.pointerUp.raise();
        },

    }, {
        //config
        target: containerRef,
        // preventDefault: true,
        
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
            // threshold: 0.05

        },

        drag: {
            pointer:{
                touch:true,
            },
            // delay:true,
            // threshold: 2,
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