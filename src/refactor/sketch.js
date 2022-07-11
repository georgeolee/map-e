import { VirtualCanvas } from "./VirtualCanvas";
import { VirtualCanvasVisualizer } from "./VirtualCanvasVisualizer";
import * as COLOR from './colors';
import { p5Flags, settings, display, vc } from "./globals";
import { History } from "./History";

import { CHECKERBOARD_COUNT, CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT, DEG_TO_RAD, BG_MAX_SIZE, RAD_TO_DEG } from "./constants";


import { recolor, colorFromAngle } from "./vectorEncoding";


export function sketch(p){

    let emap = p.createImage(settings.size.x, settings.size.y);
    let bg = null;  //background image

    let bgBaked = null;

    let cb = p.createImage(CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT); //checkerboard (static background)
    
    let editPixel = null;

    // const vc = new VirtualCanvas(p);
    vc.p5 = p;
    const viz = new VirtualCanvasVisualizer(vc);
    
    const history = new History(emap);

    const downloadAnchor = document.createElement('a');

    //TODO 


    // canvas sizing / resizing
        // best approach?
        // maybe -> size wrapper div via css, resize p5 canvas to fit inside?


    //canvas element resize handling

    //how to detect canvas resize ? resizeobserver?


    vc.setImage(emap);

    p.setup = function(){

        p.frameRate(60);
        

        const parentRect = p.canvas.parentElement.getBoundingClientRect()
        p.createCanvas(parentRect.width, parentRect.height);

        p.noSmooth();
        p.noFill();
        p.noStroke();

        createCheckerboard();
        drawCheckerboard();
                

        //REVISIT THIS
        const resizeObserver = new ResizeObserver(handleCanvasResize);
        resizeObserver.observe(p.canvas); //p5 canvas element

        vc.setImage(emap)

        drawEmap(); 

        history.push();
        
    }


    p.draw = function(){
        handleP5Flags();

        // TEST - currently moved to resizeobserver callback
        // if(/* canvas element resize check */){
        //     handleCanvasResize();
        // }

        if(editPixel){
            editPixelColor();
        }

        drawCheckerboard();
        if(vc.image) drawEmap();
    }

    function handleP5Flags(){

        if(p5Flags.undo.isRaised){
            history.step(-1);            
        }

        if(p5Flags.redo.isRaised){
            history.step(1);
        }

        if(p5Flags.export.isRaised){
            exportEmap();
        }

        if(p5Flags.recolor.isRaised){
            if(emap) recolor(emap);
        }

        if(p5Flags.loadEmpty.isRaised){
            createEmap(settings.size.x, settings.size.y);
        }

        if(p5Flags.loadURL.isRaised){
            loadEmap(settings.url);
        }

        if(p5Flags.loadBackgroundURL.isRaised){
            loadBackground(settings.bgUrl);
        }

        if(p5Flags.bakeBackgroundOpacity.isRaised){
            if(bg) bakeBackgroundOpacity(settings.bgAlpha, () => p5Flags.dirtyBackground.lower());            
        }

        if(p5Flags.pointerDown.isRaised && !p5Flags.pointerIgnore.isRaised){
            handlePointerDown();
        }

        if(p5Flags.pointerUp.isRaised){
            handlePointerUp();
        }

        if(p5Flags.pointerIgnore.isRaised){
            cancelEdit();
        }


        //observer disconnect?

        //lower all p5Flags except for ones marked sticky
        for(const f in p5Flags){
            if(!p5Flags[f].isSticky) p5Flags[f].lower();
        }
    }

    function drawEmap(){
        p.push();


        // p.applyMatrix(...vc.getTransformMatrix())
        
        
        //TEST - spring
        p.applyMatrix(...vc.animated.matrix)


        //draw background & emap image

        if(bg){
            if(p5Flags.dirtyBackground.isRaised){
                p.push();
                p.tint(255, settings.bgAlpha);
                viz.drawImage(bg);
                p.pop();

            }
            else{
                viz.drawImage(bgBaked);
            }
        }
        viz.drawImage(emap);

        //draw grid
        viz.drawGrid();
        
        //draw pixel outline?
        if(!p5Flags.pointerIgnore.isRaised && editPixel){ 
            viz.outlinePixel(emap, editPixel.x, editPixel.y);
        }

        //draw pixel highlight?
        else if(!p5Flags.pointerIgnore.isRaised && !p5Flags.isTouch.isRaised){


            //TEST - animated matrix
            const pLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY, true);  // transform canvas element pointer coordinates to vc coords ; use animated matrix
            
            const hoverPixel = vc.getPixelAtLocalPoint(pLocal.x, pLocal.y);            
            if(hoverPixel) viz.highlightPixel(emap, hoverPixel.x, hoverPixel.y);
        }


        //draw directions
        if(settings.showDirection) viz.drawPixelDirections(emap);

        p.pop();
    }

    function createCheckerboard(){
        cb.resize(p.width, p.height);
        const size = Math.min(p.width, p.height) / CHECKERBOARD_COUNT;
        const [colA, colB] = [COLOR.BG_A[settings.editorMode], COLOR.BG_B[settings.editorMode]];
        const fillA = p.color(colA.r, colA.g, colA.b, colA.a);
        const fillB = p.color(colB.r, colB.g, colB.b, colB.a);
        
        p.push();
        for(let x = 0; x < p.width; x += size){
            for(let y = 0; y < p.height; y += size){
                const fillColor = (x / size) % 2 === (y / size) % 2 ? fillA : fillB;
                p.fill(fillColor);
                p.rect(x,y,size,size);
            }
        }
        cb.copy(p, 0, 0, p.width, p.height, 0, 0, p.width, p.height);
        p.pop();
    }

    function drawCheckerboard(){
        p.image(cb, 0, 0);
    }

    function loadBackground(url){
        p.loadImage(url, pimg => {
            bg = pimg;
            if(bg.width * bg.height > BG_MAX_SIZE * BG_MAX_SIZE){
                const scale = BG_MAX_SIZE / Math.max(bg.width, bg.height);
                bg.resize(bg.width * scale, bg.height * scale);
            }

            bgBaked = p.createImage(bg.width, bg.height);
            bgBaked.copy(bg, 0, 0, bg.width, bg.height, 0, 0, bg.width, bg.height);
            p5Flags.bakeBackgroundOpacity.raise();

            //css prop to show slider for controlling bg opacity
            document.documentElement.style.setProperty('--bg-opacity-slider-visibility', 'visible');
        })
    }

    function bakeBackgroundOpacity(alpha, callback){
        bg.loadPixels();
        bgBaked.loadPixels();
        for(let i = 0; i < bgBaked.pixels.length; i+=4){
            bgBaked.pixels[i+3] = bg.pixels[i+3] * (alpha/255);
        }
        bgBaked.updatePixels();
        callback?.();
    }

    function loadEmap(url){
        p.loadImage(url, pimg => {
            recolor(pimg);
            emap = pimg;
            vc.setImage(emap);
            history.trackImage(emap);
            history.push();
        })
    }

    function createEmap(width, height){
        emap = p.createImage(width, height);
        vc.setImage(emap);
        history.trackImage(emap);
        history.push();
    }

    function exportEmap(){
        const now = new Date();
        downloadAnchor.download = `emission-map_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.png`;

        emap.canvas.toBlob(blob => {         
            downloadAnchor.href = URL.createObjectURL(blob);
            downloadAnchor.click();
            URL.revokeObjectURL(blob);
        }, 'image/png')
    }

    function handleCanvasResize(resizeObserverEntries){

        for(const entry of resizeObserverEntries){
            if(entry.target.classList.contains('p5Canvas')){

                const rect = entry.target.getBoundingClientRect();

                //resize canvas - is this necessary to reset p5 width & height? element should already be resized at this point
                p.resizeCanvas(rect.width,rect.height,true); //resize w/o immediate redraw

                createCheckerboard();

                //rescale emap / VC
                vc.setImage(emap);

                p.redraw(); //redraw w new size, checkerboard, image scale
                
                return;
            }
        }        
    }


    function handlePointerDown(){

        //TEST - animated
        // const pLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);
        const pLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY, true);

        editPixel = vc.getPixelAtLocalPoint(pLocal.x, pLocal.y);
    }

    function handlePointerUp(){
        if(editPixel){                
            //stop editing and update history
            history.push();
            editPixel = null;
        }
    }

    function cancelEdit(){
        editPixel = null;
    }

    function editPixelColor(){        

        //pixel center coordinates in vc space
        const pixelX = editPixel.x * vc.imageScale + vc.imageScale / 2;
        const pixelY = editPixel.y * vc.imageScale + vc.imageScale / 2;

        //pointer location in vc space
        const {x:pointerX, y:pointerY} = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);

        //image pixel at pointer location
        const pointerPixel = vc.getPixelAtLocalPoint(pointerX,pointerY);

        //pointer over edit pixel?
        if(pointerPixel?.x === editPixel.x && pointerPixel?.y === editPixel.y){
            vc.setPixelColor(editPixel.x, editPixel.y, COLOR.NEUTRAL[settings.neutralColor]);
            
            const noVector = 'n/a'
            if(display.angle !== noVector){
                display.angle = noVector;
                display.refresh?.()
            }
            return;
        }
        
        let angle = Math.atan2(pointerY - pixelY, pointerX - pixelX);
        

        //handle snap behavior
        if(settings.snap.enabled){            
            angle = Math.round(angle / (settings.snap.angle * DEG_TO_RAD)) * settings.snap.angle * DEG_TO_RAD;  //round to nearest interval
        }

        const vectorColor = colorFromAngle(angle);

        vc.setPixelColor(editPixel.x, editPixel.y, vectorColor);

        //update display angle?
        const degrees = Math.round(angle * RAD_TO_DEG);
        if(display.angle !== degrees){
            display.angle = degrees;
            display.refresh?.();
        }        
    }

}