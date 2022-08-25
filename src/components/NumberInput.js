import {useEffect, useRef} from 'react';

  export function NumberInput(props){

      //props

      const {
        defaultValue = 16,
        func,
        id,
        init = true,
        onInvalid,
        min = 0,
        max = 100,
      } = props;
      

      const inputRef = useRef();

      const validateNumber = val => {
        const num = Number(val);
        if(typeof num !== 'number' || num < min || num > max) return false; //NaN / bounds check
        return num;
      }

      const handleInput = val => {
        const n = validateNumber(val);
        
        if(n === false){
          onInvalid?.(val);
        }

        else{
          func?.(n);
        }
      }

      useEffect( () =>
        {
          if(init) handleInput(inputRef.current.value);
        },
        [func, init]
      )

      return(
        <input 
            id={id}
            className='number-input'
            ref={inputRef} 
            tabIndex={0}
            type='text'
            inputMode='numeric'
            minLength={1}
            maxLength={3}
            pattern='\d*'
            defaultValue={defaultValue.toString()}
            
            onChange={(e)=> handleInput(e.target.value)}/>
      );
  }
