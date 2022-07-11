import { settings, p5Flags } from '../refactor/globals'
import { EMAP_MIN_SIZE, EMAP_MAX_SIZE } from '../refactor/constants';

import { FileInputButton } from '../components/FileInputButton';
import { Slider} from '../components/Slider/Slider.js';
import { NumberInput } from '../components/NumberInput';
import { Button } from '../components/Button';
import { Radio } from '../components/Radio';
import { Checkbox } from '../components/Checkbox';

import { vc } from '../refactor/globals';

export function Controls(props){

    return(
        <div className='controls'>
        
            <div className='button-controls'>
                <Button
                tooltip='undo'
                id='undo-button'
                onClick={()=>p5Flags.undo.raise()}
                />        

                <Button
                tooltip='Reset the canvas view.'
                id='reset-view-button'
                onClick={()=>vc.resetTransform()}
                />

                <Button
                tooltip='redo'
                id='redo-button'
                onClick={()=>p5Flags.redo.raise()}
                />

                <FileInputButton
                tooltip='Open a PNG image as a new vector map. The image will be recolored to match the encoding format.'
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

                <Button
                tooltip='Download the current vector map as a PNG image. '
                id='download-button'
                onClick={()=>p5Flags.export.raise()}
                />  

                <div className='new-emap-inputs'>
                <Button
                    tooltip='create a new blank emap'
                    id='new-emap-button'
                    onClick={()=>p5Flags.loadEmpty.raise()}
                    />

                    <div className='new-emap-size-inputs'>
                        <NumberInput
                        label='width'
                        min={EMAP_MIN_SIZE}
                        max={EMAP_MAX_SIZE}
                        func={n=>settings.size.x = n}
                        defaultValue={settings.size.x}
                        />

                        <NumberInput
                        label='height'
                        min={EMAP_MIN_SIZE}
                        max={EMAP_MAX_SIZE}
                        func={n=>settings.size.y = n}
                        defaultValue={settings.size.y}
                        />
                    </div>        
                </div>

            </div>


        <div className='snap-controls'>
            Snap
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


        <div className='toggle-controls'>
            <Checkbox
                id='viz-toggle'
                label='viz'
                tooltip='show pixel vector directions'
                func={b=>settings.showDirection = b}
                checked
                />

            <Checkbox
                id='nmap-toggle'
                label='nmap'
                tooltip='toggle normal map mode'
                func={b=>{settings.normalMapMode = b; p5Flags.recolor.raise()}}
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