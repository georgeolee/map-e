import { Button } from "./Button";

export function FileInputButton(props){

    const {
        accept = '.png',
        func = url => console.log(`url: ${url}`),
        tooltip,
        className,
        id,
    } = props;
    

    const onChange = e => {
        if(!e.target.files[0]) return;
        const url = URL.createObjectURL(e.target.files[0]);
        func(url)
    }

    return(
        <div className={'file-input app-button' + (className ? ' ' + className : '')} id={id}>   
            <Button
                className="file-input-button" 
                onClick={e => e.target.nextElementSibling?.click()} 
                tooltip={tooltip}
                />
            <input 
                type="file" 
                accept={accept} 
                className='file-input-button' 
                onChange={onChange}
                />
        </div>
    );
}