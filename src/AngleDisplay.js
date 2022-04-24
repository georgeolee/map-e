import {useState, useEffect, useRef} from 'react';

function AngleDisplay(props){

  const [dummyState, update] = useState(0); //for forcing a re-render

  const obj = props.obj;
  const displayText = typeof obj.angle === 'number' ? obj.angle + '°' : 'X';

  const self = useRef()

  const style={
    position: 'absolute',    
    left: `calc(${Number(obj.x)}px - 1.5em)`,
    top: `calc(${Number(obj.y)}px - 1.5em)`,
    display: obj.visible ? 'flex' : 'none',
    pointerEvents: 'none',
  }

  useEffect(()=>
    {
      obj.update = () => update(Math.random());
      console.log('effect')
    },[obj]
  );

  useEffect(()=>
    {
      if(obj.visible) document.body.style.cursor = 'none'
      else document.body.style.removeProperty('cursor')
    },
    [obj.visible]
  )

  return(
    <div ref={self} className={'angle-display-text'} style={style}>{displayText}</div>
  );
}

export default AngleDisplay;
