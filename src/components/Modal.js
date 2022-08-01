import { useSpring, animated, config } from "@react-spring/web";
import { useRef } from "react";

//rename this -> not really a generic modal
export function Modal(props){

    const {
        id,
        content,
        visible,
        onClick,
    } = props;

    const modalRef = useRef();

    //get canvas width
    const canvasWidth = getComputedStyle(document.documentElement).getPropertyValue('--canvas-size');

    const {width} = useSpring({
        to:{
            // width: visible ? '330px' : '0px',
            width: visible ? canvasWidth : '0px',
        },
        config: {
            ...config.wobbly,
            bounce: 0,
        },
    })



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

    const padding = 'min(30px, 10vw)';

    return(
        <animated.div
            id={id}
            ref={modalRef}
            style={{
                boxSizing: 'border-box',
                padding: padding,
                backgroundColor:'#888e',
                color: '#fff',
                fontSize:'16px',
                borderRadius:'0px 10px 10px 0px',
                

                position: 'absolute',

                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                

                touchAction: 'none',
                pointerEvents: 'none',

                opacity: opacity,
                width: width,

                maxHeight: '100%',
                height:'100%',
            }}
        >
            {content}

            {button}

        </animated.div>
    )
}