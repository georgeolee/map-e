import {useRef} from 'react'

function FileUpload(props){

  const label = props.label || 'file upload button'
  const accept = props.accept || 'image/*'

  const urlHandler = props.onChange ? props.onChange : (url) => console.log(`url: ${url}`)

  const handleUpload = (evt) => {
    if(!evt.target.files[0]) return;  //no file
    const url = URL.createObjectURL(evt.target.files[0]);
    urlHandler(url);
  }


  const fileInput = useRef()


  return(
    <>
    <button className='file-input-button' onClick={()=>fileInput.current.click()}>{label}</button>
    <input type='file' ref={fileInput} accept={accept} style={{display:'none'}} onChange={handleUpload}/>
    </>
  );
}

export default FileUpload
