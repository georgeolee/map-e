//sketch to be run by the p5 instance

export function sketch(p){
    p.disableFriendlyErrors = true;


    let mouseDownLastFrame = false;
  

  //BIG TODO - > separate out image drawing functionality 
  // some kind of virtual canvas class ? not element or p5 canvas, but the movable, scaleable canvas w/in the canvas


  //CONSTANTS & COLORS - moved to separate files ; import

  let neutralColor = N_TRANSPARENT;
  let checkerboard = null;



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
        p.fill(GRID_COL[settings.editorMode]);
        p.rect(pix.x * pr, pix.y * pr, pr,pr);
      }
      else{
        p.fill(EMAP_BOUNDS_COL[settings.editorMode]);
        p.rect(pix.x * pr, pix.y * pr, pr,pr);
      }
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

      let angle = Math.atan2(img.pixels[i+1] - 128, img.pixels[i] - 128);
      if(settings.normalMapMode === true) angle *= -1;


      const px = (i/4) % img.width;
      const py = Math.floor((i/4) / img.width);
      const pr = getPixelRatio(img); //pixel ratio

      p.push();

      p.stroke(img.pixels[i], img.pixels[i+1], img.pixels[i+2], img.pixels[i+3]);
      p.strokeWeight(Math.max( 1 * (128 / Math.max(emap.width, emap.height)), 0.8))

      const length = Math.max(pr * 1.75, p.width/16);


      p.translate(px * pr + pr/2, py * pr + pr/2);  //move to the center of the pixel

      p.rotate(angle);
      p.line(0,0,length, 0);
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