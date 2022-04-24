import {useEffect,useRef} from 'react';

function Slider(props){
  const label = props.label || 'slider'
  const min = props.min || 0
  const max = typeof props.max === 'number' ? props.max : 255
  const step = typeof props.step ==='number' ? props.step : 1

  const value = typeof props.value === 'number' ? props.value : (min + max) / 2;

  const showValue = !!props.showValue
  const onChange = props.onChange ? props.onChange : n => console.log('value: ' + n);
  const onPointerUp = props.onPointerUp || null;

  const inputRef = useRef();

  const hidden = !!props.hidden;

  const style = {
    display: hidden ? 'none' : 'block',
  }

  useEffect(()=>
    {
      inputRef.current.value = value; //initial slider value
      onChange(Number(inputRef.current.value))
    },
    []
  )


  const input = <input ref={inputRef} min={min} max={max} type='range' onChange={evt => onChange(parseFloat(evt.target.value))} onPointerUp={onPointerUp}/>;

  return(
    <label style={style}>
      {label}
      {input}
    </label>
  );
}

export default Slider
