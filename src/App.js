import './App.css';
import './components/Slider/Slider.css'

import p5 from 'p5';

import { useEffect, useRef } from 'react';

import { sketch } from './refactor/sketch';

import { settings, appPointer, flags, clip, display } from './refactor/globals'

import { TouchHandler } from './TouchHandler';
import { FileInputButton } from './components/FileInputButton';
import { Slider} from './components/Slider/Slider.js';

import { NumberInput } from './components/NumberInput';

import { Button } from './components/Button';

import { EMAP_MIN_SIZE, EMAP_MAX_SIZE } from './refactor/constants';
import { DisplayArea } from './components/DisplayArea';
import { Radio } from './components/Radio';
import { Checkbox } from './components/Checkbox';

//TODO:

  // look through use-gesture/react docs

  //  touch / trackpad gestures - move to hook?
        // > related: wrapper component for p5 canvas
        // > split gesture tracking etc to wrapper

  //  layout

  //  p5 sketch - running slow on mobile w/ high point count ; some culprit other than just mobile ? check sketch.js for bottlenecks

  //  useTooltip hook

  // > general tidy up of newly added stuff

  // viz toggle ? 


  // trackpad 2F swipe

  // implement bg transform?

  // > work on touch handling
      //  > pinch zoom - orient around pinch center? would prob require changes to vc matrix handling and rethinking zoom setting structure; something like a vc.zoomFromLocalPoint function

//BUGFIX:

  //pixel hovering is broken on desktop?

function App() {

  const p5ContainerRef = useRef();
  const touchHandler = useRef(new TouchHandler());

  //attach new p5 instance
  useEffect(()=>{
    const p5Instance = new p5(sketch, p5ContainerRef.current);

    return () => {p5Instance.remove()};
  });

  //p5 pointer ignore on click outside of canvas area
  useEffect(()=>{
    
    const disableP5Pointer = () => appPointer.p5Ignore = true;
    const enableP5Pointer = () => appPointer.p5Ignore = false;
    
    document.body.addEventListener('pointerdown', disableP5Pointer);
    document.body.addEventListener('pointerup', enableP5Pointer);

    return () => {
      document.body.removeEventListener('pointerdown', disableP5Pointer);
      document.body.removeEventListener('pointerup', enableP5Pointer);
    }
  });

  //wheel zoom ; react onWheel handler is passive (no preventDefault() allowed), so attach here instead
  useEffect(()=>{

    const p5Container = p5ContainerRef.current;

    const doZoom = evt => {
       const zoomDelta = evt.deltaY * -1;

      settings.zoom.raw = clip(settings.zoom.raw + settings.zoom.raw*zoomDelta * settings.zoom.sensitivity, settings.zoom.min, settings.zoom.max);
      // settings.zoom.level = Math.sqrt(settings.zoom.raw);    
      settings.zoom.level = settings.zoom.raw


       evt.preventDefault(); //prevent scrolling page
    }
    p5Container.addEventListener('wheel', doZoom);

    return () => {
      p5Container.removeEventListener('wheel', doZoom);
    }
  });


  /*touch input handling */
  useEffect(() => {
    const th = touchHandler.current;
    const p5Container = p5ContainerRef.current;
    
    th.onTouchCountChange = count => {
      
      //prevent accidental editing during multi-touch gestures
      if(count > 1) appPointer.p5Ignore = true;

      //flag touch device, for ignoring hover etc.
      flags.isTouch.raise();   // for p5
      document.documentElement.classList.add('touch-device'); //  for css
    }

    th.onPinchZoom2F = zoomFactor => {
      settings.zoom.level = clip( settings.zoom.raw * zoomFactor, settings.zoom.min, settings.zoom.max);
    }

    th.onPinchZoomFinish2F = () => {
      settings.zoom.raw = settings.zoom.level;  //bake the new zoom level in to use as starting point for next pinch gesture
    }

    th.onSwipe2F = (dx, dy) => {
      settings.scroll.x += dx / settings.zoom.level;
      settings.scroll.y += dy / settings.zoom.level;
    }

    th.attach(p5Container);

    return () => th.detach();
  });




  /****************TOUCH STUFF TESTING END */

  return (
    <div 
      className="App no-select"
      onPointerMove={evt=>{
        appPointer.clientX = evt.clientX;
        appPointer.clientY = evt.clientY;

        const rect = p5ContainerRef.current.getBoundingClientRect();
        appPointer.p5X = evt.clientX - rect.left;
        appPointer.p5Y = evt.clientY - rect.top;

        appPointer.overCanvas = 
          appPointer.p5X >= 0 &&
          appPointer.p5Y >= 0 &&
          appPointer.p5X <= rect.width &&
          appPointer.p5Y <= rect.height;

        
        //SCROLL DRAG
        if(appPointer.scrollDragging){

          //evt.movementX/Y always zero for pointermove on safari (at least my out of date version), so get position delta manually

          const dx = evt.pageX - appPointer.dragLastPagePos.x;
          const dy = evt.pageY - appPointer.dragLastPagePos.y;

          settings.scroll.x += dx / settings.zoom.level;
          settings.scroll.y += dy / settings.zoom.level;

          appPointer.dragLastPagePos.x = evt.pageX;
          appPointer.dragLastPagePos.y = evt.pageY;
        }

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

      <div 
        ref={p5ContainerRef} 
        id='p5-container'

        onPointerDown={evt=>{
            appPointer.isDownP5 = true;
            evt.target.setPointerCapture(evt.pointerId);

            let button = evt.altKey ? 1 : evt.button;

            const buttonCallbacks = {
              0 : () => {appPointer.isDownP5 = !appPointer.p5Ignore},      //LEFT
              1 : () => {
                evt.preventDefault();                
                appPointer.p5Ignore = true; 
                appPointer.scrollDragging = true;  
                appPointer.dragLastPagePos = {
                  x : evt.pageX,
                  y : evt.pageY
                }                
              },  //MIDDLE
              default : () => {appPointer.p5Ignore = true},
            };

            const handleButtonDown = buttonCallbacks[button] ?? buttonCallbacks['default'];

            handleButtonDown?.();

            evt.stopPropagation(); //  stop the event from bubbling up to parent pointerdown handler
          }}

        onPointerUp={evt=>{
            appPointer.isDownP5 = false;
            appPointer.scrollDragging = false;
            evt.target.releasePointerCapture(evt.pointerId);
          }}
        
      ></div>

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
   

      {/*  add snap settings */}
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
