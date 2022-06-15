import './App.css';
import p5 from 'p5';

import { useEffect, useRef } from 'react';

import { sketch } from './refactor/sketch';

import { settings, appPointer, flags, clip } from './refactor/globals'

import { TouchHandler } from './TouchHandler';

//TODO:

  // > smooth out zooming
  // > get undo / redo working -> flags & keyboard listeners

  // > work on touch handling ****
      //  > pinch zoom - make proportional, add some kind of distance tracking

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
       //zooming
       const zoomDelta = evt.deltaY * -1;

      //this needs work -> make zoom behavior more smooth
      //  settings.zoom.raw += zoomDelta * settings.zoom.sensitivity;
      //  settings.zoom.raw = clip(settings.zoom.raw, settings.zoom.min, settings.zoom.max);
      //  settings.zoom.level = Math.sqrt(settings.zoom.raw)


      //TEST

      //this feels better
      settings.zoom.raw = clip(settings.zoom.raw + settings.zoom.raw*zoomDelta * settings.zoom.sensitivity, settings.zoom.min, settings.zoom.max);
      // settings.zoom.level = Math.sqrt(settings.zoom.raw);    
      settings.zoom.level = settings.zoom.raw

      //END TEST

       evt.preventDefault(); //prevent scrolling page
    }
    p5Container.addEventListener('wheel', doZoom);

    return () => {
      p5Container.removeEventListener('wheel', doZoom);
    }
  });


  /*****************TOUCH STUFF TESTING */
  useEffect(() => {
    const th = touchHandler.current;
    const p5Container = p5ContainerRef.current;
    
    th.onTouchCountChange = n => {
      if(n > 1) appPointer.p5Ignore = true;

      //flag touch device
      flags.isTouch = true;
    }

    th.onPinchZoom2F = delta => {
      settings.zoom.raw = clip(settings.zoom.raw + settings.zoom.raw*delta * settings.zoom.sensitivity, settings.zoom.min, settings.zoom.max);
      // settings.zoom.level = Math.sqrt(settings.zoom.raw);    
      settings.zoom.level = settings.zoom.raw  
    }

    th.onSwipe2F = (dx, dy) => {
      settings.scroll.x += dx / settings.zoom.level;
      settings.scroll.y += dy / settings.zoom.level;
    }

    th.attach(p5Container);

    return () => th.detach();
  });



  //print to screen for mobile testing
  useEffect(()=>{
    const th = touchHandler.current;

    const status = document.getElementById('touch-status');

    const updateStatus = () => status.textContent = th.log + '\t:::::\t' + th.touches;

    const interval = 100;

    const updateInterval = setInterval(updateStatus, interval);

    return () => clearInterval(updateInterval);
  })



  /****************TOUCH STUFF TESTING END */

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

          settings.scroll.x += dx / settings.zoom.level;
          settings.scroll.y += dy / settings.zoom.level;

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

            evt.stopPropagation(); //  stop the event from bubbling up to parent pointerdown handler
          }}

        onPointerUp={evt=>{
            appPointer.isDownP5 = false;
            appPointer.scrollDragging = false;
            evt.target.releasePointerCapture(evt.pointerId);
          }}

        onTouchStart={evt=>{
          // edit : 1 touch, same as pointer edit
          // zoom : 2 touch pinch
          // scroll : 2 touch swipe

          // if currently doing edit / zoom / scroll > ignore additional touches


        }}

        onTouchMove={evt=>{
          // 1 touch : edit

          // 2 touch : dot product of vectors ? 
            // greater than 0 : same direction > swipe
            // less than 0 : different directions > pinch

        }}
        
      ></div>

      <div
        id='touch-status'
        style={{backgroundColor:'black',color:'white',minHeight:'2em',width:'100%'}}
      ></div>


    </div>
  );
}

export default App;
