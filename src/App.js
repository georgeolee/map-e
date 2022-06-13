import './App.css';
// import Canvas from './Canvas.js';
import p5 from 'p5';

import { useEffect, useRef } from 'react';

import { sketch } from './refactor/sketch';

import { settings, appPointer, flags } from './refactor/globals'

//TODO:

  // > pixel erase
  // > get undo / redo working
  // > figure out touch interactions
        //  - edit
        //  - scroll
        //  - zoom

function App() {

  const p5ContainerRef = useRef();

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

    const doZoom = evt => {
       //zooming
       const zoomDelta = evt.deltaY;
       settings.zoom += zoomDelta * settings.zoomSensitivity;

       //clip it here
       //exp behavior here or in vcv? leaning towards second, and just set raw number here

       evt.preventDefault(); //prevent scrolling page
    }
    p5ContainerRef.current.addEventListener('wheel', doZoom);

    return () => {
      p5ContainerRef.current.removeEventListener('wheel', doZoom);
    }
  });

  return (
    <div 
      className="App"
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

          settings.scroll.x += dx / settings.zoom;
          settings.scroll.y += dy / settings.zoom;

          appPointer.dragLastPagePos.x = evt.pageX;
          appPointer.dragLastPagePos.y = evt.pageY;
        }

      }}
      >



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

            evt.stopPropagation(); //  stop the event from bubbling up to parent event handler
          }}

        onPointerUp={evt=>{
            appPointer.isDownP5 = false;
            appPointer.scrollDragging = false;
            evt.target.releasePointerCapture(evt.pointerId);
          }}
        
      ></div>


    </div>
  );
}

export default App;
