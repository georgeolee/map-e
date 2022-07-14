import { useSpring, useSpringRef, animated, config } from "@react-spring/web";
import { useEffect } from "react";

import { useState } from "react";

export function Modal(props){

    const {
        id,
        content,
        visible,
        onClick,
    } = props;

    

    const {width, height } = useSpring({
        to:{
            width: visible ? '50vw' : '0vw',
            height: visible ? `${50 / (window.innerWidth / window.innerHeight)}vh` : '0vh',
        },
        config: {
            ...config.wobbly,
            
        }

    })

    const {opacity} = useSpring({
        to:{
            opacity: visible ? 1 : 0,
        },
        config: {
            ...config.wobbly,
            clamp: true
        }

    })

    const {top} = useSpring({
        to: {top: '0'},
        from: { top: '40vh'},
        reverse: !visible,
        reset: visible,
        config: config.wobbly
    })

    const button = onClick ? <button onClick={onClick}>CLICK ME</button> : null;

    useEffect(()=>{
        console.log('modal render')
    })

    const padding = 'min(100px, 10vw)';

    return(
        <animated.div
            style={{
                boxSizing: 'border-box',
                padding: padding,
                backgroundColor:'#444e',
                color: '#fff',
                fontSize:'32px',
                borderRadius:'10px',
                

                position: 'relative',
                bottom: top,

                display: 'flex',
                // display: display,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                

                touchAction: 'none',
                pointerEvents: 'none',

                opacity: opacity,
                width: width,
                height: height
            }}
        >
            {content}

            {button}

        </animated.div>
    )
}