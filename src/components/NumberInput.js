import {useEffect, useRef} from 'react';

  export function NumberInput(props){

      //props

      const {
        label = 'number input',
        min = 0,
        max = 100,
        step = 1,
        defaultValue = (min + max) / 2,
        func,
        id,
        className,
        init = true,        
      } = props;
      

      const inputRef = useRef();


      useEffect( () =>
        {
          // inputRef.current.value = value;     //set initial value
          if(init) func?.(Number(inputRef.current.value));
        },
        []
      )

      return(
        <label 
          className={'number-input' + className ? ' ' + className : ''} 
          id={id}>
          <input 
            ref={inputRef} 
            defaultValue={defaultValue}
            type='number' 
            min={min} 
            max={max} 
            step={step} 
            onChange={(e)=> func?.(Number(e.target.value))}/>
          {label}
        </label>
      );
  }
