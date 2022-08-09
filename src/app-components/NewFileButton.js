import { Modal } from "./Modal";

import { Button } from "../components/Button";
import { NumberInput } from "../components/NumberInput";

import { useState } from "react";
import { p5Flags, settings, display } from "../refactor/globals";

import { EMAP_MAX_SIZE, EMAP_MIN_SIZE } from "../refactor/constants";

export function NewFileButton(props){

    const {
        tooltip
    } = props;

    const [showing, showModal] = useState(false);

    const modalContent = (
        <>

        Enter dimensions for the new vector map. 
        <br/>
        Note: the current texture will not be saved.
        <div className='new-emap-size-inputs'>
            <NumberInput
            id='width-input'
            min={EMAP_MIN_SIZE}
            max={EMAP_MAX_SIZE}
            func={n=>{settings.size.x = n}}
            defaultValue={settings.size.x}
            />
            X
            <NumberInput
            id='height-input'
            min={EMAP_MIN_SIZE}
            max={EMAP_MAX_SIZE}
            func={n=>settings.size.y = n}
            defaultValue={settings.size.y}
            />
        </div>
        
        <button onClick={()=> {
            p5Flags.loadEmpty.raise(); 
            display.size = {...settings.size};
            display.refresh?.();
            showModal(false);
            }}>OK</button>

        <button onClick={()=> {showModal(false)}}>Cancel</button>
        </>        
    );

    const modalProps = {
        id:'new-file-modal',
        visible: showing,
        hideModal: () => {
            showModal(false)            
        },
        content: modalContent
    }

    return(
        <>
            <Button 
                id='new-emap-button'
                tooltip={tooltip}
                onClick={()=>showModal(true)}
                />
            <Modal {...modalProps}/>
        </>        
    )
}