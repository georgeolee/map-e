import { useSpring, animated, config } from "@react-spring/web";
import { useEffect, useRef } from "react";


export function Modal(props){

    const {
        id,
        content,
        visible,
        onClick,
    } = props;

    const modalRef = useRef();


    const {width} = useSpring({
        to:{
            // width: visible ? '100%' : '0%',
            width: visible ? '330px' : '0px',            
        },
        config: {
            ...config.wobbly,
            // bounce: 0.2,
            bounce: 0,
            // clamp: true,
            
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

    useEffect(()=>{
        console.log('modal render')
    })

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

                maxHeight: '100%',
                height:'100%',
            }}
        >
            {content}

            {button}

        </animated.div>
    )
}