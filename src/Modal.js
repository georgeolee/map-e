import {useRef} from 'react';

function Modal(props){
  const id = props.id || ''
  const buttonText = props.buttonText || 'Close Modal'
  const content = props.content || 'Modal content goes here.'
  const title = props.title || 'Modal Title'


  const modalRef = useRef()
  const onClick = props.onClick ? props.onClick : () => modalRef.current.style.display = 'none'


  return(
    <div className={`modal ${!!props.open ? 'open' : 'closed'}`} id={id} ref={modalRef}>
      <div className="modal-window">
        <div className="modal-title">{title}</div>
        <div className="modal-content">{content}</div>
        <button className="modal-button" onClick={onClick}>{buttonText}</button>
      </div>
    </div>
  );
}

export default Modal;
