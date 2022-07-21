import {useEffect, useRef} from 'react';

  export function NumberInput(props){

      //props

      const {
        defaultValue = 16,
        func,
        id,
        init = true,        
      } = props;
      

      const inputRef = useRef();


      useEffect( () =>
        {
          if(init) func?.(Number(inputRef.current.value));
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
            maxLength={2}
            pattern='\d*'
            defaultValue={defaultValue.toString()}
            
            onChange={(e)=> func?.(Number(e.target.value))}/>
      );
  }
