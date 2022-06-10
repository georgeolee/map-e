import './App.css';
// import Canvas from './Canvas.js';
import p5 from 'p5';

import { useEffect, useRef } from 'react';

import { sketch } from './refactor/sketch';

function App() {

  const p5ContainerRef = useRef();

  //attach new p5 instance
  useEffect(()=>{
    const p5Instance = new p5(sketch, p5ContainerRef.current);

    return () => {p5Instance.remove()};
  });

  return (
    <div className="App">



      <div ref={p5ContainerRef} id='p5-container'></div>


    </div>
  );
}

export default App;
