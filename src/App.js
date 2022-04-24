import './App.css';
import Canvas from './Canvas.js';
import p5 from 'p5';

function App() {


  /*
  *
  *     TODO: general cleanup & trimming unused stuff

        BIG TODO: confirm cross-browser support for controls on mac & windows ; trackpad AND mouse ; firefox chrome safari edge

              mouse seems good
              trackpad stuff seems pretty good


        DONT FORGET: in package.json: "homepage"="./"
              keeps relative urls from breaking if app gets moved around (i think)

        SAFARI IN GENERAL: what is going on with grid size on home page?
        SAFARI WEIRDNESS: img container weirdness; maybe auto margins in css?
        WHAT THE HECK SAFARI??? : alt-drag not working to scroll ; issue with pointermove.movementX/Y always zero on safari ; mousemove works, maybe newer versions?


        TODO: run another build test
        TODO: push new build online

        CONTINUE: emap html cleanup — style sheet situation

        VVVVVV THIS!!!

        NEXT UP: particle widget housekeeping ; try building a standalone react app version like map editor ; break up into modules?

  */




  return (
    <div className="App">



      <Canvas/>


    </div>
  );
}

export default App;
