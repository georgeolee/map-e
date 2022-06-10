import {useEffect, useRef} from 'react';

function Radio(props){
  const name = props.name || 'radio-group-default';
  const onChecked = props.onChecked ? props.onChecked : () => console.log(`selected ${label}`);
  const label = props.label || 'radio item';

  const inputRef = useRef();

  useEffect( () =>
    {
      inputRef.current.checked = !!props.checked;
      if(!!props.checked) onChecked();
    },
    []
  );

  return(
    <label className='radio'>
    <input type='radio' name={name} ref={inputRef} onChange={evt => {if(evt.target.checked) onChecked()}}/>
    {label}
    </label>
  );
}

export default Radio;
