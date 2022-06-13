import './App.css';
// import Canvas from './Canvas.js';
import p5 from 'p5';

import { useEffect, useRef } from 'react';

import { sketch } from './refactor/sketch';

import { settings, appPointer, flags } from './refactor/globals'

function App() {

  const p5ContainerRef = useRef();

  //attach new p5 instance
  useEffect(()=>{
    const p5Instance = new p5(sketch, p5ContainerRef.current);

    return () => {p5Instance.remove()};
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

        //  if (appPointer.drag) doScroll()
      }}

      onPointerDown={evt=>{ //does this work?
        appPointer.p5Ignore = true;
      }}

      onPointerUp={evt=>{ //does this work?
        appPointer.p5Ignore = false;
      }}
      >



      <div 
        ref={p5ContainerRef} 
        id='p5-container'

        onPointerDown={evt=>{
            appPointer.isDownP5 = true;
            evt.target.setPointerCapture(evt.pointerId);

            const buttonCallbacks = {
              0 : () => {appPointer.isDownP5 = appPointer.p5Ignore},      //LEFT
              2 : () => {appPointer.p5Ignore = true; /* appPointer.startDrag() */},  //RIGHT
              default : () => {appPointer.p5Ignore = true},
            };

            const handleButtonDown = buttonCallbacks[evt.button] ?? buttonCallbacks['default'];

            handleButtonDown?.();
          }}

        onPointerUp={evt=>{
            appPointer.isDownP5 = false;
            evt.target.releasePointerCapture(evt.pointerId);
          }}

        onWheel={evt=>{
            //zooming
            const zoomDelta = evt.deltaY;
            settings.zoom += zoomDelta;

            //clip it here
            //exp behavior here or in vcv? leaning towards second, and just set raw number here

          }}
      ></div>


    </div>
  );
}

export default App;
