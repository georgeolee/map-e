import { VirtualCanvas } from "./VirtualCanvas";
import { VirtualCanvasVisualizer } from "./VirtualCanvasVisualizer";
import * as COLOR from './colors';
import { settings } from "./globals";
import { History } from "./History";

import { CHECKERBOARD_COUNT, CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT } from "./constants";

import { pointerState } from "./globals";

import { recolor, colorFromAngle } from "./vectorEncoding";

export function sketch(p){

    let emap = p.createImage(settings.size.x, settings.size.y);
    let bg = null;  //background image
    let cb = p.createImage(CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT); //checkerboard (static background)
    
    let editPixel = null;

    const vc = new VirtualCanvas(p);
    const viz = new VirtualCanvasVisualizer(vc);
    
    const history = new History(emap);

    //TODO 

    //canvas element resize handling

    //how to detect canvas resize ? resizeobserver?

    //handle flags


    //history management

    vc.setImage(emap);

    p.setup = function(){
        p.noSmooth();
        createCheckerboard();
        drawCheckerboard();
        drawEmap();
        history.push();

        const resizeObserver = new ResizeObserver(handleCanvasResize);
        resizeObserver.observe(p.canvas); //p5 canvas element
    }

    p.draw = function(){
        handleFlags();

        //get zoom & scroll amounts
        vc.scroll = settings.scroll;
        vc.zoom = settings.zoom;

        if(/* canvas element resize check */){
            handleCanvasResize();
        }

        //use this check to ignore pointer actions during scroll, zoom, etc
        if(!pointerState.p5Ignore){

            //pointer down / up change since last frame
            if(pointerState.isDownP5 !== pointerState.wasDownP5){
                handlePointerStateChange();
            }

            //currently editing a pixel
            if(editPixel){
                editPixelColor();
            }
        }        

        drawCheckerboard();
        drawEmap();
    }

    function handleFlags(){
        //emap create / load / export

        //background load
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
        if(editPixel){ 
            viz.outlinePixel(emap, editPixel.x, editPixel.y);
        }

        //draw pixel highlight?
        else if(/* mouse over p5 canvas */){
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

    function handleCanvasResize(){
        //resize canvas

        //create new checkerboard

        //rescale emap / VC?
    }

    function handlePointerStateChange(){        

        if(pointerState.isDownP5){
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

        pointerState.wasDownP5 = pointerState.isDownP5;
    }

    function editPixelColor(){        

        //pixel center coordinates in vc space
        const pixelX = editPixel.x + vc.imageScale / 2;
        const pixelY = editPixel.y + vc.imageScale / 2;

        //pointer location in vc space
        const {x:pointerX, y:pointerY} = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);

        let angle = Math.atan2(pointerY - pixelY, pointerX - pixelX);
        
        //handle snap behavior
        if(settings.snap.enabled){
            //round to nearest interval
            angle = Math.round(angle / settings.snap.angle) * settings.snap.angle;
        }

        const vectorColor = colorFromAngle(angle);

        vc.setPixelColor(editPixel.x, editPixel.y, vectorColor);

    }

}