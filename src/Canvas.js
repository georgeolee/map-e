
import {useEffect, useRef, useState} from 'react';
import p5 from 'p5';
import Checkbox from './Checkbox.js';
import Radio from './Radio.js';
import NumberInput from './NumberInput.js';
import Slider from './Slider.js'
import FileUpload from './FileUpload.js'
import AngleDisplay from './AngleDisplay.js'
import Modal from './Modal.js'
import {HR} from './HR.js'

// CONSTANTS - move to external file
//#region 
// const ZOOM_MIN = 0.25;
// const ZOOM_MAX = 10;
// const ZOOM_SENSITIVITY = 0.005;

// const SCROLL_SPEED = 20;
// const SCROLL_FAST_SPEED = 50;

// const CANVAS_WIDTH = 600;
// const CANVAS_HEIGHT = 600;
//#endregion


//SETTINGS

const now = new Date();
const isNightTime = now.getHours() < 6 || now.getHours() > 18;


//move to external file
const settings = {
  // snap : {
  //   enabled : false,
  //   angle : 22.5,
  // },

  // size : {
  //   x : 16,
  //   y : 16,
  // },

  // url: null,
  // bgUrl : null,
  // bgAlpha : 55,
  // showDirection : true,
  // showDegreesOnEdit : true,
  // showGrid : true,
  // normalMapMode : false,

  // p5IgnoreMouseDown : false,

  // editorMode: 'light',
}

//moved to external file
const flags = {
//   export : false,
//   recolor : false,
//   loadEmpty : false,
//   loadURL : false,
//   loadBackgroundURL : false,
//   undo : false,
//   redo : false,

//   bakeBackgroundOpacity : false,
//   dirtyBackground : false,

//   createCheckerboard : false,
}

//key input for scrolling w/ keyboard
//moved to external file
const keyScroll = {
  // up : false,
  // down : false,
  // left : false,
  // right : false,
  // shift : false,
}

//moved to external file
const angleDisplay = {
  // x: 0,
  // y: 0,
  // angle: 0,
  // update: undefined,  // <AngleDisplay> component will assign a callback here for triggering its next re-render ; gets called from <Canvas> p5Container via pointer events
  // visible: false,
}

const onCanvasPointerMove = evt => {
  if(!settings.showDegreesOnEdit) return;

  angleDisplay.x = evt.pageX;
  angleDisplay.y = evt.pageY;

  if(angleDisplay.visible) angleDisplay?.update()
}

const onCanvasPointerDown = evt => {

  if(!settings.showDegreesOnEdit) return;
  angleDisplay.visible = !evt.altKey; //show the angle display if editing, but not if scrolling w alt+click
  angleDisplay?.update()
}

const onCanvasPointerUp = evt => {
  if(!settings.showDegreesOnEdit) return;
  angleDisplay.visible = false;
  angleDisplay?.update()
}


//TODO - figure out what settings / functions need to be exposed outside of the sketch


//VIEW TRANSFORMATIONS
let zoomAmount = 1; //current level of zoom  ;;;; use zoom() to zoom in /out, this to get the actual number
const translation = {x: 0, y: 0};

const zoom = (amount) => zoomAmount = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomAmount + amount * ZOOM_SENSITIVITY));
const zoom2 = (amount) => { //use this one instead of zoom() ; takes current level of zoom into account for more linear behavior
  let amt = (Math.abs(zoomAmount)) * amount
  zoom(amt);
}

const scroll = (x, y) => {
  translation.x = Math.min(CANVAS_WIDTH, Math.max(-CANVAS_WIDTH, translation.x + x/zoomAmount));
  translation.y = Math.min(CANVAS_HEIGHT, Math.max(-CANVAS_HEIGHT, translation.y + y/zoomAmount));
}

const setNormalMapMode = (b) => { settings.normalMapMode = !!b ; flags.recolor = true};


const setSnap = (snap) => {
  settings.snap.enabled = typeof snap === 'number';
  if(typeof snap === 'number') settings.snap.angle = snap;
}

const showVectorCountWarning = (text) => {
  const modal = document.getElementById('vector-count-warning')
  modal.classList.add('open')
  modal.classList.remove('closed')
  modal.querySelector('.modal-content').innerHTML = text;
  document.body.classList.toggle('modal-open')
}

const hideVectorCountWarning = () => {
  const modal = document.getElementById('vector-count-warning')
  modal.classList.remove('open')
  modal.classList.add('closed')
  document.body.classList.toggle('modal-open')
}


//    S
//    K
//    E
//    T
//    C
//    H
//
//    S
//    T
//    A
//    R
//    T

function sketch(p){

  let mouseDownLastFrame = false;

  //MATH CONSTANTS
  const DEG_TO_RAD = Math.PI / 180;
  const RAD_TO_DEG = 180 / Math.PI;

  //CONSTANTS

  const N_BLUE = p.color(128,128,255,255);  //neutral blue color
  const N_TRANSPARENT = p.color(128,128,255,0);  //neutral blue color with transparent alpha channel

  let neutralColor = N_TRANSPARENT;
  let checkerboard = null;

  const BG_CHECKERBOARD_COUNT = 32; //# of checkerboard squares


  const BG_COL_A = {
    light: 250,
    dark: 67,
  }

  const BG_COL_B = {
    light: 245,
    dark: 65,
  }

  const GRID_COL = {
    light: p.color(0,0,255,64),
    dark : p.color(128,255,255,64),
  }

  const EMAP_BOUNDS_COL = {
    light: p.color(0,0,255,128),
    dark : p.color(128,255,255,128),
  }

  const ACTIVE_PIXEL_COL = {
    light: p.color(0,0,255,128),
    dark : p.color(128,255,255,128),
  }

  const GRID_SPACING = 1;  //# of emap pixels per grid square




  const BLUE_NORMALIZED_MAX = 0.1;
  const ALPHA_NORMALIZED_MIN = 0.9;

  /********HISTORY STUFF??*****/
  let history = [];
  let currentHistoryIndex = 0;

  const MAX_HISTORY_LENGTH = 20;

  // const LUT = new LookupTable()

  function pixelArrayClone(pixels){
    const arr = [];
    for(let i = 0; i < pixels.length; i++){
      arr.push(pixels[i]);
    }
    return arr;
  }

  function pixelArraySet(pixels, arr){
    if(pixels.length !== arr.length){
      console.log(`warning - js array length (${arr.length}) does not match p5 pixel array length (${pixels.length})`);
    }
    for(let i = 0; i < pixels.length && i < arr.length; i++){
      pixels[i] = arr[i];
    }
  }

  function stepHistory(n){

    currentHistoryIndex = Math.min(history.length - 1, Math.max(0, currentHistoryIndex + n));

    emap.loadPixels();
    pixelArraySet(emap.pixels, history[currentHistoryIndex]);
    emap.updatePixels();

    recolor(emap)
  }

  function pushHistory(pimg){
    const startTime = Date.now();

    pimg.loadPixels();

    const pixels = pixelArrayClone(pimg.pixels);  // the new entry

    if(history.length > 0){ //don't push if nothing changed
      let foundChange = false;
      const oldPixels = history[currentHistoryIndex];
      for(let i = 0; i < pixels.length; i++){
        if(oldPixels[i] !== pixels[i]){
          foundChange = true;
          break;
        }
      }
      if(foundChange === false) return;
    }

    if(history.length > 0 && currentHistoryIndex < history.length - 1){ //if not at the newest entry, chop off the rest of the timeline before pushing
       history = history.slice(0, currentHistoryIndex + 1);
    }

    else if(history.length >= MAX_HISTORY_LENGTH){
      history = history.slice(1, currentHistoryIndex + 1);  //drop the oldest entry if reached max history size
      currentHistoryIndex--;
    }


    history.push(pixels);

    if(history.length > 1) currentHistoryIndex++; // don't increment on the first push
  }

  function eraseHistory(){
    history = [];
    currentHistoryIndex = 0;
  }

  /***************/


  //EMISSION MAP
  let emap = null;
  let emapLoaded = false;
  let backgroundImage = null;
  let backgroundImageBaked = null;

  const loadEmapURL = (url) => {  //load an image from a url; stores the resulting p5image in emap
    emapLoaded = false;
    emap = null;
    p.loadImage(url, (pimg) => {

      emapLoaded = true;
      emap = pimg;

      console.log(`loaded new emap from url;\t width: ${pimg.width}\theight: ${pimg.height}`)
      /********HISTORY STUFF*********/
      eraseHistory();
      recolor(emap);
      pushHistory(emap);
      /*******************/

      const VECTOR_LIMIT = 32 * 32;

      if(pimg.width * pimg.height > VECTOR_LIMIT){
        pimg.loadPixels()
        let count = 0
        for(let i = 0; i < pimg.pixels.length; i+=4){
          if(Math.abs(pimg.pixels[i+2] - 128) < 255 * BLUE_NORMALIZED_MAX && pimg.pixels[i+3] > 255 * ALPHA_NORMALIZED_MIN){  //gonna have to draw this one
            count++
          }
        }


        if(count > VECTOR_LIMIT){

            // alert(`High vector count detected!
            // \n${count} pixels in your image have been mapped to 2D vectors. Vector drawing starts to slow down at around ${VECTOR_LIMIT} pixels.
            // \nPixel direction display has been switched OFF to maintain performance.
            // \nYou can reenable this setting manually if you need it, but you might want to consider importing a lower-res version of your image first.
            // \nAlternatively, you can mask out areas of your image from the mapping algorithm by making them transparent or giving them a very high / very low blue channel value. I would suggest doing this in a different image editor :-)
            // `)

            const warning = (
            `${count} pixels in your image have been mapped to 2D vectors. Vector drawing starts to slow down at around ${VECTOR_LIMIT} pixels.<br/><br/>
            Pixel direction display has been switched OFF to maintain performance.
            You can reenable this setting manually if you need it, but you might want to consider importing a lower-res version of your image first.<br/><br/>
            Alternatively, you can mask out areas of your image from the mapping algorithm by making them transparent or giving them a very high / very low blue channel value. I would suggest doing this in a different image editor :-)<br/><br/>
            `);

            showVectorCountWarning(warning)

            const cb = document.getElementById('checkbox-directions')
            if(cb.checked) cb.click()
        }
      }
    });
  }


  const getPixelRatio = (pimg) => pimg.width/pimg.height >= p.width/p.height ? p.width/pimg.width : p.height/pimg.height; //gets the number of canvas pixels per pimg pixel when pimg is scaled to fill the canvas as much as possible without stretching or cropping


  //EDIT STATE
  let editing = false;
  let activePixel = null;


  //MOUSE POS GETTER FUNCTIONS - return 'real' mouse position within the canvas, accounting for zoom & scrolling
  const mouseTransformedY = () => (p.mouseY - p.height/2) / zoomAmount + p.height/2 - translation.y
  const mouseTransformedX = () => (p.mouseX - p.width/2) / zoomAmount  + p.width/2   - translation.x


  function applyTransformations(){

    //SCROLL
    p.translate(translation.x * zoomAmount , translation.y * zoomAmount);

    //ZOOM
    p.translate(p.width/2, p.height/2)
    p.scale(zoomAmount)
    p.translate(-p.width/2, -p.height/2)

  }

  const isCanvasPoint = (x, y) => x >= 0 && x <= p.width && y >= 0 && y <= p.height;

  //SETUP FUNCTION
  p.setup = function(){
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p.noSmooth();
    loadEmptyEmap(settings.size.x,settings.size.y);

    createCheckerboard(BG_CHECKERBOARD_COUNT, BG_COL_A[settings.editorMode], BG_COL_B[settings.editorMode]);
  }

  //DRAW FUNCTION
  p.draw = function(){

    if(flags.loadEmpty === true){
      loadEmptyEmap(settings.size.x,settings.size.y);
      flags.loadEmpty = false;
    }

    if(flags.loadURL === true){
      console.log(`p5 received loadURL flag ; url : ${settings.url}`)
      loadEmapURL(settings.url);
      flags.loadURL = false;
    }

    if(flags.loadBackgroundURL === true){
      console.log(`p5 received loadURL flag ; url : ${settings.bgUrl}`)
      loadBackgroundURL(settings.bgUrl, () => {
        bakeBackgroundOpacity(settings.bgUrl, settings.bgAlpha, () => flags.dirtyBackground = false);
      });

      flags.loadBackgroundURL = false;
    }

    if(flags.bakeBackgroundOpacity === true){
      bakeBackgroundOpacity(settings.bgUrl, settings.bgAlpha, ()=>
      {
        flags.dirtyBackground = false;
      });
      flags.bakeBackgroundOpacity = false;
    }

    if(flags.createCheckerboard === true){
      createCheckerboard(BG_CHECKERBOARD_COUNT, BG_COL_A[settings.editorMode], BG_COL_B[settings.editorMode]);
      flags.createCheckerboard = false;
    }

    //DRAW BG CHECKERBOARD
    if(checkerboard) p.image(checkerboard,0,0)

    if(!emapLoaded) return;


    /*****LISTENERS START*****/ //< listen for stuff happening outside of the sketch

    if(flags.export === true){
      exportEMap();
      flags.export = false;
    }

    if(flags.recolor === true){
      recolor(emap);
      flags.recolor = false;
    }

    if(flags.undo === true){
      stepHistory(-1);
      flags.undo = false;
    }

    if (flags.redo === true) {
      stepHistory(1);
      flags.redo = false;
    }



    /******LISTENERS END******/


    applyTransformations();     //APPLY ZOOM AND SCROLL


    if(backgroundImage && settings.bgAlpha > 0){

      if(flags.dirtyBackground){
        p.push()
        p.tint(255, settings.bgAlpha);
        drawImageFullscreen(backgroundImage, false); //DRAW BACKGROUND ?
        p.pop()
      }
      else{
        drawImageFullscreen(backgroundImageBaked, false);
      }

    }



    drawImageFullscreen(emap);  //DRAW IMAGE

    if(settings.showGrid) drawGrid();  //DRAW GRID LINES
    if(settings.showDirection) visualizeDirections(emap)  //DRAW DIRECTION LINES

    //MOUSE PRESS
    if(p.mouseIsPressed){

      if(!editing){

        if( settings.p5IgnoreMouseDown === true ||  // SHOULD IGNORE MOUSE EVENT - scrolling or something
            !isCanvasPoint(p.mouseX, p.mouseY) ||   // OUT OF CANVAS BOUNDS
            mouseDownLastFrame                      // not a click
        ) return;


        mouseDownLastFrame = true;

        if( mouseTransformedX() < 0 ||
            mouseTransformedX() > emap.width * getPixelRatio(emap) ||
            mouseTransformedY() < 0 ||
            mouseTransformedY() > emap.height * getPixelRatio(emap)
        ){
          angleDisplay.visible = false;
          angleDisplay?.update();
          return;  //OUT OF IMAGE BOUNDS
        }



        editing = true;

        activePixel = getImagePixel(mouseTransformedX(),mouseTransformedY(), emap);

      }

      const neutral = settings.normalMapMode ? N_BLUE : N_TRANSPARENT;

      //mouse inside active pixel —> set neutral color
      if(isImagePixel(mouseTransformedX(), mouseTransformedY(),activePixel.x,activePixel.y,emap)){
        setPixelColor(emap, activePixel.x, activePixel.y, neutral)
        /****display obj****/
        angleDisplay.angle = null;
        if(settings.showDegreesOnEdit) angleDisplay?.update();
        /*******************/
      }

      //mouse outside of active pixel —> set color by angle
      else{

        const pr = getPixelRatio(emap);
        const pixelCanvasX = activePixel.x * pr + pr/2;
        const pixelCanvasY = activePixel.y * pr + pr/2;
        let angle = Math.atan2(mouseTransformedY() - pixelCanvasY, mouseTransformedX() - pixelCanvasX);

        if(settings.snap.enabled) angle = Math.round((angle * RAD_TO_DEG / settings.snap.angle)) * settings.snap.angle * DEG_TO_RAD;  //snap to nearest increment of snap angle

        /****display obj****/
        angleDisplay.angle = Math.round(angle * RAD_TO_DEG) * (settings.normalMapMode ? -1 : 1);
        /*******************/

        setPixelColorFromAngle(emap, activePixel.x, activePixel.y, angle);
      }

      drawActivePixelBounds();
    }

    //NO MOUSE PRESS —> stop editing
    else if(editing){
      editing = false;

      activePixel = null;


      /********HISTORY STUFF*********/

      pushHistory(emap);

      /**********END HISTORY STUFF******/
    }

    else{
      if(!settings.p5IgnoreMouseDown && !p.keyIsDown(p.ALT)) highlightHoverPixel();
    }
    mouseDownLastFrame = p.mouseIsPressed;
  }


  function highlightHoverPixel(){
    const mx = mouseTransformedX();
    const my = mouseTransformedY();
    const pr = getPixelRatio(emap);

    if( mx >= 0 &&
        mx <= emap.width * pr &&
        my >= 0 &&
        my <= emap.height * pr ){

      const pix = getImagePixel(mx, my, emap);
      const pixelIndex = getPixelIndexFromCoords(pix.x, pix.y, emap);

      p.push();
      p.noStroke();

      emap.loadPixels();
      const isNeutral = Math.abs(emap.pixels[pixelIndex + 2] - 128) / 128 > BLUE_NORMALIZED_MAX || (emap.pixels[pixelIndex + 3] - 128) / 128 < ALPHA_NORMALIZED_MIN;

      if(isNeutral){
        p.fill(BG_COL_A[settings.editorMode]);
        p.rect(pix.x * pr, pix.y * pr, pr,pr);
        // p.fill(EMAP_BOUNDS_COL[settings.editorMode]);
        p.fill(GRID_COL[settings.editorMode]);
        p.rect(pix.x * pr, pix.y * pr, pr,pr);
      }
      else{
        p.fill(EMAP_BOUNDS_COL[settings.editorMode]);
        p.rect(pix.x * pr, pix.y * pr, pr,pr);
      }

      // p.fill(EMAP_BOUNDS_COL[settings.editorMode]);
      // p.rect(pix.x * pr, pix.y * pr, pr,pr);
      p.pop();
    }
  }

  function isImagePixel(cx, cy, px, py, img){ // returns true if canvas pixel (cx,cy) displays pixel (px, py) of img ; false otherwise
    const pr = getPixelRatio(img);
    const left = px * pr;
    const top = py * pr;
    const right = left + pr;
    const bottom = top + pr;
    return (cx >= left && cx <= right && cy >= top && cy <= bottom);
  }

  function recolor(pimg){
    pimg.loadPixels();

    const normalize = (val) => (val - 128) / 128;
    const neutralColor = settings.normalMapMode ? N_BLUE : N_TRANSPARENT;

    for(let i = 0; i < pimg.pixels.length; i+= 4){

      //is it a neutral pixel?
      const isNeutralPixel = ( Math.abs(normalize(pimg.pixels[i + 2])) > BLUE_NORMALIZED_MAX  || normalize(pimg.pixels[i + 3]) < ALPHA_NORMALIZED_MIN );

      //color by angle, or make transparent / blue if neutral
      const c = isNeutralPixel ? neutralColor : colorFromAngle(angleFromColorRG(pimg.pixels[i], pimg.pixels[i+1]));

      pimg.pixels[i] = p.red(c);
      pimg.pixels[i+1] = p.green(c);
      pimg.pixels[i+2] = p.blue(c);
      pimg.pixels[i+3] = p.alpha(c);
    }
    pimg.updatePixels();
  }

  function angleFromColorRG(r, g){ //angle in radians

    const y = (g - 128) * (settings.normalMapMode ? -1 : 1);  //flip y for normal map mode
    const x = r - 128;
    return Math.atan2(y, x);
  }

  function colorFromAngle(angle, returnP5Color = true){  //angle in radians
    const V0 = {x: 1, y: 0};    //a unit vector representing 0 rotation

    let vr = { //the same vector rotated by angle
      x: V0.x * Math.cos(angle) - V0.y * Math.sin(angle),
      y: V0.x * Math.sin(angle) + V0.y * Math.cos(angle),
    };

    //invert y if set in editor
    if(settings.normalMapMode === true) vr.y *= -1;

    const _r = Math.min(128 + Math.round(vr.x * 128), 255);  //prevent rounding up to 256 ; probably there's a better way to do this?
    const _g = Math.min(128 + Math.round(vr.y * 128), 255);
    const _b = 128;                          //Z is always 0
    const _a = 255;

    return  returnP5Color ? p.color(_r,_g,_b,_a) : {r:_r, g:_g, b:_b, a:_a};
  }



  function getImagePixel(canvasX, canvasY, img){  //get pixel coordinates in image dimensions of an image displayed fullscreen on the canvas
    let pr = getPixelRatio(img);  //# of canvas pixels per image pixel
    const ix = Math.floor(canvasX / pr);
    const iy = Math.floor(canvasY / pr);
    return {x:ix, y:iy};
  }


  //returns first pixel array index (containing the red channel value) for a given pixel x,y in p5 image pimg
  const getPixelIndexFromCoords = (x, y, pimg) => (pimg.width * y + x) * 4;

  function setPixelColor(img, px, py, color){
    img.loadPixels();
    let i = getPixelIndexFromCoords(px, py, img);
    img.pixels[i] = p.red(color);
    img.pixels[i+1] = p.green(color);
    img.pixels[i+2] = p.blue(color);
    img.pixels[i+3] = p.alpha(color);
    img.updatePixels();
  }

  function setPixelColorFromAngle(img,px,py,angle){
    img.loadPixels();
    const c = colorFromAngle(angle, false);
    let i = getPixelIndexFromCoords(px, py, img);
    img.pixels[i] = c.r;
    img.pixels[i+1] = c.g;
    img.pixels[i+2] = c.b;
    img.pixels[i+3] = c.a;
    img.updatePixels();
  }


  function drawImageFullscreen(img, drawBorder=true){  //draws image as big as possible while still fitting inside canvas (at 100% zoom)
    const pr = getPixelRatio(img);
    p.push();
    p.scale(pr);
    p.image(img, 0, 0);  //draw the image

    if(drawBorder){
      p.stroke(EMAP_BOUNDS_COL[settings.editorMode]);
      p.strokeWeight(1/(pr * zoomAmount));
      p.noFill();
      p.rect(0,0,img.width,img.height);  //draw border around image bounds
    }

    p.pop();
  }

  function visualizeDirections(img){
    for(let i = 0; i < img.pixels.length; i+=4){

      const normalize = (val) => (val - 128) / 128;

      //skip pixels that are transparent or have a strong (very low or very high) blue component
      if(Math.abs(normalize(img.pixels[i + 2])) > BLUE_NORMALIZED_MAX) continue;
      if(normalize(img.pixels[i + 3]) < ALPHA_NORMALIZED_MIN) continue;

      // let angle = LUT.get(img.pixels[i], img.pixels[i+1])
      let angle = Math.atan2(img.pixels[i+1] - 128, img.pixels[i] - 128);
      if(settings.normalMapMode === true) angle *= -1;


      const px = (i/4) % img.width;
      const py = Math.floor((i/4) / img.width);
      const pr = getPixelRatio(img); //pixel ratio

      p.push();

      p.stroke(img.pixels[i], img.pixels[i+1], img.pixels[i+2], img.pixels[i+3]);
      // p.strokeWeight(3);
      p.strokeWeight(Math.max( 1 * (128 / Math.max(emap.width, emap.height)), 0.8))

      const length = Math.max(pr * 1.75, p.width/16);


      p.translate(px * pr + pr/2, py * pr + pr/2);  //move to the center of the pixel

      p.rotate(angle);
      p.line(0,0,length, 0);

      // p.line(0,0, length * Math.cos(angle), length * Math.sin(angle))

      p.stroke(0)
      p.strokeWeight(1 * (128 / Math.max(emap.width, emap.height)))
      p.point(0,0)

      p.pop();
    }
  }

  //CREATE BACKGROUND CHECKERBOARD

  function createCheckerboard(count, colA, colB){
    const g = p.createGraphics(p.width, p.height);

    const size = g.width/count; //checkerboard size

    g.noStroke();
    for(let i = 0; i < g.width; i+= size){
      for(let j = 0; j < g.height; j+= size){
        g.fill(i % (size*2) === j % (size*2) ? colA : colB);
        g.rect(i, j, size, size)
      }
    }
    // return g;
    checkerboard = g;
  }

  //DRAW GRID
  function drawGrid(){
    const size = getPixelRatio(emap) * GRID_SPACING;
    p.push();
    p.stroke(GRID_COL[settings.editorMode]);
    p.strokeWeight(Math.min(1,1/zoomAmount));

    const ewidth = emap.width * getPixelRatio(emap); //emap canvas width
    const eheight = emap.height * getPixelRatio(emap); //emap canvas height
    for(let i = 0; i < ewidth; i+= size){
      p.line(i, 0, i, eheight);
    }
    for(let i = 0; i < eheight; i+= size){
      p.line(0, i, ewidth, i);
    }
    p.pop();
  }


  function drawActivePixelBounds(){
    if(activePixel === null) return;
    p.push()
    p.noFill();
    p.stroke(ACTIVE_PIXEL_COL[settings.editorMode]);

    const pr = getPixelRatio(emap);
    const thickness = 3/zoomAmount;

    p.strokeWeight(thickness);
    p.rect(activePixel.x * pr + thickness/2, activePixel.y * pr + thickness/2, pr - thickness, pr - thickness);
    p.pop()
  }


  function exportEMap(){
    const now = new Date();
    p.save(emap, `emission-map_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.png`);
  }


  function loadEmptyEmap(w, h){

    const neutral = settings.normalMapMode ? N_BLUE : N_TRANSPARENT;

    emap = p.createImage(w,h);
    emapLoaded = true;
    emap.loadPixels()
    for(let i=0; i < emap.pixels.length; i+=4){
      emap.pixels[i] = p.red(neutral);
      emap.pixels[i+1] = p.green(neutral);
      emap.pixels[i+2] = p.blue(neutral);
      emap.pixels[i+3] = p.alpha(neutral);
    }
    emap.updatePixels();

    /********HISTORY STUFF*********/
    eraseHistory();
    pushHistory(emap);
    /*******************/
  }


  function loadBackgroundURL(url, callback = null){
    p.loadImage(url, (pimg) => {
      backgroundImage = pimg;
      callback?.()
    });
  }

  function bakeBackgroundOpacity(url, alpha_255, callback = null){
    console.log(`baking background opacity`)
    p.loadImage(url, pimg => {
      pimg.loadPixels();
      const a_normalized = alpha_255 / 255; //normalized alpha value
      for(let i = 0; i < pimg.pixels.length; i+=4){
        pimg.pixels[i + 3] *= a_normalized;
      }
      pimg.updatePixels();
      backgroundImageBaked = pimg;
      console.log(`baked background with opacity ${alpha_255}`)
      callback?.()
    });
  }

}



function Canvas(props)
{
  //reference to the container that will hold the p5 sketch
  const p5ContainerRef = useRef();
  const [hasBG, setHasBG] = useState(false);  //has a bg image? used for disable/enabling bg alpha slider

  //should work for detecting a pinch zoom trackpad gesture on chrome & firefox
  const wheelZoom = (evt) => {
    if(evt.ctrlKey !== true) return;  //scroll instead
    evt.preventDefault();
    zoom2(-evt.deltaY);//invert direction
  }

  const wheelScroll = (evt) => {

    if(evt.ctrlKey === true) return; //trackpad pinch gesture or ctrl + mouseWheel
    evt.preventDefault();
    const sensitivity = 1;

    let dx = evt.deltaX * sensitivity;
    let dy = evt.deltaY * sensitivity;

    if(evt.shiftKey){
      [dx, dy] = [dy, dx]
    }

    scroll(-dx,-dy);
  }

  const pointerDragScroll = (evt) => {
    evt.preventDefault()
    if(evt.buttons === 4 || (evt.altKey && evt.buttons === 1))  //mouse wheel down OR left mouse down + alt key
    {
      const dx = evt.movementX || 0;
      const dy = evt.movementY || 0;
      scroll(dx, dy);

    }
  }


//TODO - look at this again ; rename or refactor?
  const capturePointer = (evt) => {
    evt.target.setPointerCapture(evt.pointerId);


    if(evt.altKey || evt.buttons === 4) {
      settings.p5IgnoreMouseDown = true; //ignore mouse in p5 if drag scrolling, etc
      evt.preventDefault(); //don't do any other weird stuff on middle mouse press
    }
  }

  const releasePointer = (evt) => {
    evt.target.releasePointerCapture(evt.pointerId);
    settings.p5IgnoreMouseDown = false;

  }

  const handleKeyDown = (evt) => {

    const centerView = () => {
      translation.x = 0;
      translation.y = 0;
      zoomAmount = 1;
    }

    const flagUndo = () => flags.undo = true;
    const flagRedo = () => flags.redo = true;

    const callbacks = {
      'z' : evt.shiftKey ? flagRedo : flagUndo,
      'Z' : evt.shiftKey ? flagRedo : flagUndo,
      'y' : flagRedo,
      'Y' : flagRedo,
      'f' : centerView,
      'F' : centerView,

      'ArrowLeft' : () => keyScroll.left = true,
      'ArrowRight' : () => keyScroll.right = true,
      'ArrowUp' : () => keyScroll.up = true,
      'ArrowDown' : () => keyScroll.down = true,
      'Shift' : () => keyScroll.shift = true,
    }

    if(callbacks[evt.key]) evt.preventDefault();
    callbacks[evt.key]?.()  //if callbacks[evt.key] is not null or undefined, call it as a function
  }

  const handleKeyUp = (evt) => {
    const callbacks = {
      'ArrowLeft' : () => keyScroll.left = false,
      'ArrowRight' : () => keyScroll.right = false,
      'ArrowUp' : () => keyScroll.up = false,
      'ArrowDown' : () => keyScroll.down = false,
      'Shift' : () => keyScroll.shift = false,
    }

    callbacks[evt.key]?.()
  }

  useEffect(() =>
    {

        // setInterval(()=> document.body.style.cursor = angleDisplay.visible ? 'none' : 'default', 100)

        const p5Container = p5ContainerRef.current;

        //on initial component render, create a new p5 instance running 'sketch' and parent it to the referenced container
        const p5Instance = new p5(sketch, p5Container);
        console.log('created new p5 instance');

        //pointer capture & release
        p5Container.addEventListener('pointerdown', capturePointer);
        p5Container.addEventListener('pointerup', releasePointer);

        //trackpad zoom
        p5Container.addEventListener('wheel', wheelZoom);
        p5Container.addEventListener('wheel', wheelScroll);
        p5Container.addEventListener('pointermove', pointerDragScroll);

        document.body.addEventListener('keydown', handleKeyDown);
        document.body.addEventListener('keyup', handleKeyUp);

        console.log('attached event listeners')

        const keyScrolling = setInterval(() => {
            const step = keyScroll.shift ? SCROLL_FAST_SPEED * 60/1000 : SCROLL_SPEED * 60/1000;
            let x = 0, y = 0;
            if(keyScroll.up) y -= step;
            if(keyScroll.down) y += step;
            if(keyScroll.left) x -= step;
            if(keyScroll.right) x += step;

            if(x || y) scroll(-x, -y);
          }
          ,1000/60);


        //on component destruction, delete the p5 instance
        return () => {
          p5Instance.remove();
          console.log('cleaned up p5 instance');

          p5Container.removeEventListener('pointerdown', capturePointer);
          p5Container.removeEventListener('pointerup', releasePointer);
          p5Container.removeEventListener('wheel', wheelZoom);
          p5Container.removeEventListener('wheel', wheelScroll);
          p5Container.removeEventListener('pointermove', pointerDragScroll);
          p5Container.removeEventListener('keydown', handleKeyDown);


          document.body.removeEventListener('keydown', handleKeyDown);
          document.body.removeEventListener('keyup', handleKeyUp);

          clearInterval(keyScrolling);

          console.log('removed event listeners')

        }
    },
    []
  );



  const handleEmapUpload = (url) => {
    settings.url = url;
    flags.loadURL = true;
    console.log(url)
  }

  const handleBackgroundUpload = (url) => {
      settings.bgUrl = url;
      flags.loadBackgroundURL = true;
      console.log(url);
      if(!hasBG) setHasBG(true)
  }

  const detectOutsideCanvasClick = evt => {
    settings.p5IgnoreMouseDown = evt.target.parentElement !== p5ContainerRef.current && evt.target !== p5ContainerRef.current;
  }

  return(
    <div id='wrapper' className='flex-row no-select' onPointerDown={detectOutsideCanvasClick} onPointerUp={()=>{settings.p5IgnoreMouseDown = false}}>
        <Modal id="vector-count-warning" onClick={hideVectorCountWarning} buttonText='Got It!' title='Vector Count Warning'/>
        <AngleDisplay obj={angleDisplay}/>
        {/*CENTER - HEADER*/}
        <div className="App-header">
          <h1>map-e</h1>
          <div className='small-text'>PNG vector map editor</div>
          <div className='small-text'>click and drag to begin</div>
        </div>

        {/*LEFT COLUMN*/}
        <div className="flex-col controls-left">
          Display
          <Checkbox checked label='Pixel Directions' onChange={(b) => settings.showDirection = b} id='checkbox-directions'/>
          <Checkbox checked label='Pixel Grid' onChange={(b) => settings.showGrid = b}/>
          <Checkbox checked label='Degrees On Edit' onChange={(b) => settings.showDegreesOnEdit = b}/>
          <Checkbox label='Normal Map Mode' onChange={setNormalMapMode}/>

          <HR/>

          Snap Angle
          <Radio name='snap-angle' label='off' onChecked={()=>setSnap(false)} checked/>
          <Radio name='snap-angle' label='22.5' onChecked={()=>setSnap(22.5)}/>
          <Radio name='snap-angle' label='45' onChecked={()=>setSnap(45)}/>
          <Radio name='snap-angle' label='90' onChecked={()=>setSnap(90)}/>
          <HR/>

          Editor
          <Radio name='editor-mode' label='Light' onChecked={()=>{settings.editorMode = 'light'; flags.createCheckerboard = true; document.body.classList.remove('dark')}} checked={!isNightTime}/>
          <Radio name='editor-mode' label='Dark' onChecked={()=>{settings.editorMode = 'dark'; flags.createCheckerboard = true; document.body.classList.add('dark')}} checked={isNightTime}/>
        </div> {/*LEFT COLUMN END*/}

        {/*CENTER - CANVAS*/}
        <div id='p5-container' ref={p5ContainerRef} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onPointerDown={onCanvasPointerDown}></div>

        {/*RIGHT COLUMN*/}
        <div className='flex-col controls-right'>
          Download Vector Map
          <button  id='download-button' onClick={() => flags.export = true}>Download PNG</button>

          <HR/>

          New Vector Map
          <button id='clear-button' onClick={() => flags.loadEmpty = true}>New PNG</button>
          <NumberInput label=' width' min={8} max={256} value={16} step={8} onChange={(n) => settings.size.x = n} int/>
          <NumberInput label=' height' min={8} max={256} value={16} step={8} onChange={(n)=> settings.size.y = n} int/>

          <HR/>

          Open Vector Map
          <FileUpload accept='.png' label='Open PNG' onChange={handleEmapUpload}/>

          <HR/>

          Open Background Image
          <FileUpload accept='.png, .jpg, .jpeg' label='Choose Image' onChange={handleBackgroundUpload}/>
          <br/>
          <Slider hidden={!hasBG} label='Background Opacity' min={0} max={255} value={50} onChange={n => {settings.bgAlpha = n; flags.dirtyBackground = true}} onPointerUp={() => flags.bakeBackgroundOpacity = true}/>
        </div>  {/*RIGHT COLUMN END*/}

        {/*CENTER - DIVIDER*/}
        <HR className='column-2'/>

        {/*INSTRUCTIONS*/}
        <div className='instructions'>

         <p style={{fontSize:'24px', fontWeight:'bold'}}>Controls</p>

         <div className="action">
          Add Pixel:&emsp;
          <div className="bindings">
            <code>click&nbsp;+&nbsp;drag</code>
          </div>
         </div>

         <div className="action">
          Remove Pixel:&emsp;
          <div className="bindings">
            <code>click</code>
          </div>
         </div>

         <div className="action">
          Undo:&emsp;
          <div className="bindings">
            <code>ctrl&nbsp;+&nbsp;Z</code>
          </div>
         </div>

         <div className="action">
          Redo:&emsp;
          <div className="bindings">
            <code>ctrl&nbsp;+&nbsp;Y</code>&ensp;|&ensp;
            <code>ctrl&nbsp;+&nbsp;shift&nbsp;+&nbsp;Z</code>
          </div>
         </div>

         <div className="action">
          Scroll:&emsp;
          <div className="bindings">
            <code>middle&nbsp;click&nbsp;+&nbsp;drag</code>&ensp;|&ensp;
            <code>alt&nbsp;+&nbsp;click&nbsp;+&nbsp;drag</code>&ensp;|&ensp;
            <code>mouse&nbsp;wheel</code>&ensp;|&ensp;
            <code>arrow&nbsp;keys</code>
          </div>
         </div>

         <div className="action">
          Zoom:&emsp;
          <div className="bindings">
            <code>ctrl&nbsp;+&nbsp;mouse&nbsp;wheel</code>
          </div>
         </div>

         <div className="action">
          Refocus View:&emsp;
          <div className="bindings">
            <code>F</code>
          </div>
         </div>

        </div>{/*END INSTRUCTIONS*/}

    </div>
  );
}

export default Canvas;
