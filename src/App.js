import './App.css';
import './components/Slider/Slider.css'


import { useEffect, useRef } from 'react';


import { flags, display } from './refactor/globals'


import { DisplayArea } from './app-components/DisplayArea';
import {CanvasContainer} from './app-components/Canvas'

import { Controls } from './app-components/Controls';

import { Transform } from './refactor/Transform';

//TODO:


  //  new git branch - refactor VC transform to allow zoom from point other than center
  //      stateful transform ->
  //      add scale & translate functions to operate on current matrix instead of recomputing matrix each time from scroll & zoom

  //  number input
  //  control layout

  //  p5 sketch - mobile performance slowdown?

  // viz toggle ? does it influence performance at all?

  // > general tidy up of newly added stuff




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

      <DisplayArea
        id='display'
        displayData={display}
        />

      <Controls
        />

    </div>
  );
}

export default App;
