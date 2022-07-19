import { useGesture } from "@use-gesture/react";
import p5 from "p5";

import { useRef, useEffect } from "react";

import { sketch } from "../refactor/sketch";

import { settings, clip, p5Flags } from "../refactor/globals";
import { vc } from "../refactor/globals";


import { useSpring, useSpringRef } from "@react-spring/web";
import { TooltipModal } from "../components/TooltipModal";

export function CanvasContainer(props){

    const containerRef = useRef(null);

    let pinchX, pinchY;

    let isWheelPinch = false; //try to distinguish trackpad from mouse wheel
    const wheelDeltaYThreshold = 75; //treat as wheel pinch instead of trackpad or touch if initial dy exceeds this threshold


    const springRef = useSpringRef()

    let frameRequest = 0;

    const anim = useSpring({
        ref: springRef,
        matrix: vc.getTransformMatrix(),
        inverseMatrix: vc.getInverseTransformMatrix(),
        config: {
            friction: 10,
            tension: 400,
            mass:0.11,
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

            //check for mouse wheel pinch
            isWheelPinch = 
                state.event.deltaY && // - filter out touch events
                Math.abs(state.event.deltaY) > wheelDeltaYThreshold; // - filter out trackpad input (hopefully)


            //convert client coords to element coords
            const [clientX, clientY] = state.origin;            
            const rect = containerRef.current.getBoundingClientRect();

            //get pinch origin in VC coordinates ; use the same origin for the duration of the pinch gesture
            ({x:pinchX, y:pinchY} = vc.getWorldToLocalPoint(clientX - rect.left, clientY - rect.top));
            vc.startPinch();            
        },
        onPinch: state => {

            //skip concurrent pinch events - fix for ctrl + mouse wheel firing twice on last tick
            if(state.memo?.timestamp === state.timeStamp) return state.memo;

            if(//catch any trackpad input that was misidentified as using mouse wheel
                isWheelPinch && 
                state.memo && 
                (
                    Math.abs(state.memo.deltaY) !== Math.abs(state.event.deltaY) || 
                    Math.abs(state.event.deltaY) < wheelDeltaYThreshold
                )){
                isWheelPinch = false;
            }
         
            // console.log('last: ', state.last, '\ttimestamp: ', state.timeStamp, '\tfirst: ', state.first, 'using mouse wheel: ', isWheelPinch)
        
            //clamp scale between min & max settings
            const currentCanvasScale = vc.getScale(false);

            // TEST

            let ticks;

            let zf;

            if(isWheelPinch){
                ticks = (state.memo?.ticks ?? 0) + Math.sign(state.event.deltaY);
                zf = 1 + (0.2 / 1 * -ticks);
                zf = zf = clip(zf, settings.zoom.min / currentCanvasScale, settings.zoom.max / currentCanvasScale);
            }

            else zf = clip(state.movement[0], settings.zoom.min / currentCanvasScale, settings.zoom.max / currentCanvasScale);
            
            vc.scaleFromPoint(zf, pinchX, pinchY);

            handleVCTransformation();

            return {
                timestamp: state.timeStamp,
                deltaY: state.event.deltaY,
                ticks: ticks,   //  net positive + negative wheel events ; for determining zoom if using mouse wheel
            }
        },
        onPinchEnd: state => {
            p5Flags.pointerIgnore.lower();
            vc.endPinch();

            //TEST
            isWheelPinch = false;
        },

        //wheel
        onWheel: state => {
            if(state.event.ctrlKey || state.pinching) return; //don't fire while pinching
            const scale = vc.getScale(false);
            const  sensitivity = state.altKey ? 0.1 : 1;
            const delta = state.delta.map(d => d * sensitivity);
            if(state.shiftKey) delta.reverse();
            vc.translate(delta[0] / scale, delta[1] / scale);
            
            handleVCTransformation();
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

                        //add deltas to sum
                        dx += t.clientX - (cached?.clientX || t.clientX);
                        dy += t.clientY - (cached?.clientY || t.clientY);                                             
                    }

                    //get average delta
                    dx /= state.event.changedTouches.length;
                    dy /= state.event.changedTouches.length;

                    const scale = vc.getScale(false);
                    vc.translate(dx / scale, dy / scale);
                    
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
            scaleBounds:{
                ...settings.zoom
            }
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

    //safari - prevent interfering w trackpad zoom
    useEffect(()=>{
        document.addEventListener('gesturestart', (e) => e.preventDefault())
        document.addEventListener('gesturechange', (e) => e.preventDefault())
    }, [])

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


            ><TooltipModal/></div>
    )
}