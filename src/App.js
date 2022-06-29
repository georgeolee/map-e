import './App.css';
import './components/Slider/Slider.css'


import { useEffect, useRef } from 'react';


import { settings, flags, display } from './refactor/globals'

import { FileInputButton } from './components/FileInputButton';
import { Slider} from './components/Slider/Slider.js';

import { NumberInput } from './components/NumberInput';

import { Button } from './components/Button';

import { EMAP_MIN_SIZE, EMAP_MAX_SIZE } from './refactor/constants';
import { DisplayArea } from './components/DisplayArea';
import { Radio } from './components/Radio';
import { Checkbox } from './components/Checkbox';

import {CanvasContainer} from './components/Canvas'

//TODO:

  //  continue migrating p5 stuff & gesture handling -> canvas container


  //  layout

  //  p5 sketch - mobile performance slowdown?

  //  useTooltip hook

  // > general tidy up of newly added stuff

  // viz toggle ? 


  // implement bg transform?



function App() {

  


  return (
    <div 
      className="App no-select"

      onPointerDown={e=>{
        flags.pointerIgnore.raise();
      }}

      onPointerUp={e=>{
        flags.pointerIgnore.lower();
      }}

      onKeyDown={e=>{

        if(!(e.ctrlKey || e.metaKey)) return;

        let action;

        const actions = {
          undo : () => flags.undo.raise(),
          redo : () => flags.redo.raise(),
        }

        if(e.key === 'z'){
          action = e.shiftKey ? actions.redo : actions.undo;
        }

        else if(e.key === 'y'){
          action = actions.redo;
        }

        if(action){
          action?.();
          e.preventDefault();
        }        
      }}

      tabIndex={0}
      >

      <div className='App-header'>map-e</div>

      <CanvasContainer/>


      <div className='editor-buttons'>
        <Button
          tooltip='undo'
          id='undo-button'
          onClick={()=>flags.undo.raise()}
          />        

        <Button
          tooltip='reset view'
          id='reset-view-button'
          onClick={()=>settings.resetView()}
          />

        <Button
          tooltip='redo'
          id='redo-button'
          onClick={()=>flags.redo.raise()}
          />

        <FileInputButton
          tooltip='open vector map PNG'
          id='emap-file-input'
          func = {url => {
            settings.url = url;
            flags.loadURL.raise();
          }}
          />

        <FileInputButton
          tooltip='open background PNG'
          id='background-file-input'
          func = { url => {
            settings.bgUrl = url;
            flags.loadBackgroundURL.raise();
          }}
          />

        <Button
          tooltip='download vector map PNG'
          id='download-button'
          onClick={()=>flags.export.raise()}
          />  

        <div className='new-emap-inputs'>
          <Button
            tooltip='create a new blank emap'
            id='new-emap-button'
            onClick={()=>flags.loadEmpty.raise()}
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
   

      {/* add vector viz toggle */}

      <Slider
        min={0}
        max={255}
        id='bg-opacity-slider'
        defaultValue={settings.bgAlpha}
        func={n=>{
          settings.bgAlpha = n;
          flags.dirtyBackground.raise();
        }}
        onPointerUp={ () => {
          flags.bakeBackgroundOpacity.raise();
        }}
        />

        <div>
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

      <DisplayArea
        id='display'
        displayData={display}
        />

      <Checkbox/>      

    </div>
  );
}

export default App;
