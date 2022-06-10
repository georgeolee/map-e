import {useEffect, useRef} from 'react';

function Checkbox(props){
  const id = props.id;
  const labelText = props.label || 'checkbox';
  const onChange = props.onChange ? props.onChange : (b) => console.log('checked: ' + b);

  const inputRef = useRef();

  useEffect( () =>
    {
      inputRef.current.checked = !!props.checked;
      onChange(!!props.checked);
    },
    []
  );

  return(
    <label className='checkbox'>
      <input id={id} type='checkbox' onChange={(evt) => onChange(evt.target.checked)} ref={inputRef}/>
      {labelText}
    </label>
  );
}

export default Checkbox
