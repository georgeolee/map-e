import { settings, p5Flags } from '../globals'

import { FileInputButton } from '../components/FileInputButton';
import { Slider} from '../components/Slider/Slider.js';
import { Button } from '../components/Button';
import { Radio } from '../components/Radio';
import { Checkbox } from '../components/Checkbox';

import { NewFileButton } from './NewFileButton';

import { vc } from '../globals';

export function Controls(props){

    return(
        <div className='controls'>
        
            <div className='button-controls'>
                <Button
                tooltip='Undo'
                id='undo-button'
                onClick={()=>p5Flags.undo.raise()}
                />        

                <Button
                tooltip='Redo'
                id='redo-button'
                onClick={()=>p5Flags.redo.raise()}
                />

                <Button
                tooltip='Reset the canvas view.'
                id='reset-view-button'
                onClick={()=>vc.resetTransform()}
                />                

                <Button
                tooltip='Download the current vector map as a PNG image. '
                id='download-button'
                onClick={()=>p5Flags.export.raise()}
                />


                <FileInputButton
                tooltip='Open a previously downloaded vector map. Results may vary with other PNG images.'
                id='emap-file-input'
                func = {url => {
                    settings.url = url;
                    p5Flags.loadURL.raise();
                }}
                />

                <FileInputButton
                tooltip='Open a PNG image as a background. '
                id='background-file-input'
                func = { url => {
                    settings.bgUrl = url;
                    p5Flags.loadBackgroundURL.raise();
                }}
                />                  
                
                <NewFileButton
                tooltip='Create a new vector map.'
                />

            </div>

        <div className='toggle-controls'>
            
            viz
            <Checkbox
                id='viz-toggle'
                label='viz'
                tooltip='show pixel vector directions'
                func={b=>settings.showDirection = b}
                checked
                />

            nmap
            <Checkbox
                id='nmap-toggle'
                label='nmap'
                tooltip='toggle normal map mode'
                func={b=>{settings.normalMapMode = b; p5Flags.recolor.raise()}}
                />
        </div>

        <div className='snap-controls'>
            snap
            <Radio
                label='off'
                checked
                func={()=>settings.snap.set(false)}
                />    
            <Radio
                label='22.5º'
                func={()=>settings.snap.set(22.5)}
                />
            <Radio
                label='45º'
                func={()=>settings.snap.set(45)}
                />
            <Radio
                label='90º'
                func={()=>settings.snap.set(90)}
                />
        </div>
           

        <Slider
            min={0}
            max={255}
            id='bg-opacity-slider'
            defaultValue={settings.bgAlpha}
            func={n=>{
            settings.bgAlpha = n;
            p5Flags.dirtyBackground.raise();
            }}
            onPointerUp={ () => {
            p5Flags.bakeBackgroundOpacity.raise();
            }}
            />
    </div>
    );
}