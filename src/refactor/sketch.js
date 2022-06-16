import { VirtualCanvas } from "./VirtualCanvas";
import { VirtualCanvasVisualizer } from "./VirtualCanvasVisualizer";
import * as COLOR from './colors';
import { flags, settings } from "./globals";
import { History } from "./History";

import { CHECKERBOARD_COUNT, CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT, DEG_TO_RAD } from "./constants";

import { appPointer } from "./globals";

import { recolor, colorFromAngle } from "./vectorEncoding";

export function sketch(p){

    let emap = p.createImage(settings.size.x, settings.size.y);
    let bg = null;  //background image
    let cb = p.createImage(CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT); //checkerboard (static background)
    
    let editPixel = null;

    const vc = new VirtualCanvas(p);
    const viz = new VirtualCanvasVisualizer(vc);
    
    const history = new History(emap);


    //FIXED : 

    //  vc.imageScale zero / vc.getLocalPixel NaN issue in setup / draw loop
        //  > fix - make sure to call vc.setImage() before vcviz.drawImage() (inside of drawEmap()) so that image scale is nonzero

    //  grid not drawing correctly - missing lines ; scale issue
        //  > fix - don't scale weight or units in for loop ; already taken care of by apply matrix call (scaled to image size)

    //  black ghost grid > unintented stroke from checkerboard rects

    //BUGFIX / LOOK INTO:

    //  what is up with the weird black grid?
        //  maybe -> createCheckerboard - stroke from drawing rects ; would explain weird scaling inconsistencies



    //TODO 


    // canvas sizing / resizing
        // best approach?
        // maybe -> size wrapper div via css, resize p5 canvas to fit inside?


    //canvas element resize handling

    //how to detect canvas resize ? resizeobserver?

    //handle flags


    //history management

    vc.setImage(emap);

    p.setup = function(){

        

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
        handleFlags();

        //get zoom & scroll amounts
        vc.scroll = settings.scroll;
        vc.zoom = settings.zoom.level;

        // TEST - currently moved to resizeobserver callback
        // if(/* canvas element resize check */){
        //     handleCanvasResize();
        // }

        //use this check to ignore pointer actions during scroll, zoom, etc
        if(!appPointer.p5Ignore){

            //pointer down / up change since last frame
            if(appPointer.isDownP5 !== appPointer.wasDownP5){                
                handleAppPointerChange();
            }

            //currently editing a pixel
            if(editPixel){
                editPixelColor();
            }
        }        

        drawCheckerboard();
        if(vc.image) drawEmap();
    }

    function handleFlags(){

        if(flags.undo.raised){
            history.step(-1);            
        }
        if(flags.redo.raised){
            history.step(1);
        }
        //emap create / load / export

        //background load

        //observer disconnect?

        for(const f in flags){
            if(!flags[f].sticky) flags[f].lower();
        }
    }

    function drawEmap(){
        p.push();
        p.applyMatrix(...vc.getLocalToWorldMatrix()); // apply canvas transform

        //draw background & emap image
        if(bg) viz.drawImage(bg);
        viz.drawImage(emap);

        //draw grid
        viz.drawGrid();
        
        //draw pixel outline?
        if(!appPointer.p5Ignore && editPixel){ 
            viz.outlinePixel(emap, editPixel.x, editPixel.y);
        }

        //draw pixel highlight?
        else if(!appPointer.p5Ignore && appPointer.overCanvas && !flags.isTouch){
            const mLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);  // mouse transformed position            
            const hoverPixel = vc.getPixelAtLocalPoint(mLocal.x, mLocal.y);            
            if(hoverPixel) viz.highlightPixel(emap, hoverPixel.x, hoverPixel.y);
        }


        //draw directions
        viz.drawPixelDirections(emap);

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
        p.save(emap, `emission-map_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.png`);
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

    function handleAppPointerChange(){        


        if(appPointer.isDownP5){
            //on pointer down

            const pLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);        

            editPixel = vc.getPixelAtLocalPoint(pLocal.x, pLocal.y);    //get pixel (if any) under pointer
        }
        else{            

            //on pointer up
            if(editPixel){
                //stop editing and update history
                history.push();
                editPixel = null;
            }            
        }

        appPointer.wasDownP5 = appPointer.isDownP5;
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
            return;
        }
        
        let angle = Math.atan2(pointerY - pixelY, pointerX - pixelX);
        

        //handle snap behavior
        if(settings.snap.enabled){            
            angle = Math.round(angle / (settings.snap.angle * DEG_TO_RAD)) * settings.snap.angle * DEG_TO_RAD;  //round to nearest interval
        }

        const vectorColor = colorFromAngle(angle);

        vc.setPixelColor(editPixel.x, editPixel.y, vectorColor);

    }

}