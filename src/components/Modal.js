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

    

    const {width} = useSpring({
        to:{
            // width: visible ? '100%' : '0%',
            width: visible ? '360px' : '0px',
        },
        config: {
            ...config.wobbly,
            bounce: 0.2
        }

    })

    const {left} = useSpring({
        to:[
            {left: `10vh`},
            {left: '0vh'},
        ],
        from:{left:'0vh'},
        config: {
            mass: 0.1,
            tension:300,
            friction:10,
        },
        cancel:!visible
    });



    const {opacity} = useSpring({
        to:{
            opacity: visible ? 1 : 0,
        },
        config: {
            ...config.stiff,
            clamp: true
        }

    })

    const button = onClick ? <button onClick={onClick}>CLICK ME</button> : null;

    useEffect(()=>{
        console.log('modal render')
    })

    const padding = 'min(30px, 10vw)';

    return(
        <animated.div
            style={{
                boxSizing: 'border-box',
                padding: padding,
                backgroundColor:'#888e',
                color: '#fff',
                fontSize:'16px',
                borderRadius:'10px',
                

                // bottom:'100%',

                position: 'absolute',
                // bottom: top,

                display: 'flex',
                // display: display,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                

                touchAction: 'none',
                pointerEvents: 'none',

                opacity: opacity,
                width: width,

                left: left,
                maxHeight: '100%',
            }}
        >
            {content}

            {button}

        </animated.div>
    )
}