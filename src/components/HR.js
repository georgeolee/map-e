export function HR(props){
  return (
    <div className={!props.className ? 'hr' : 'hr ' + props.className}></div>
  );
}
