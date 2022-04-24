import {useEffect, useRef} from 'react';

  function NumberInput(props){

      //props
      const label = props.label || 'number input';
      const min = props.min || 0;
      const max = props.max || 100;
      const step = props.step || 1;
      const onChange = props.onChange ? props.onChange : (n) => console.log(`value: ${n}`);
      const value = typeof props.value === 'number' ? props.value : min;
      const int = !!props.int;
      

      const constrain = (_val, _min, _max) => Math.max(_min, Math.min(_max, _val));

      const inputRef = useRef();


      useEffect( () =>
        {
          inputRef.current.value = value;     //set initial value
          onChange(value);
        },
        []
      )

      return(
        <label className='number'>
          <input ref={inputRef} type='number' min={min} max={max} step={step} onChange={(evt)=> onChange(int ? constrain(Math.round(evt.target.value), min, max) : constrain(evt.target.value, min, max))}/>
          {label}
        </label>
      );
  }

export default NumberInput;
