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

    //pointer up / down handling
    //  p5 down
    //  p5 click
    //  p5 x, y
    //  
    //  down / up / x / y

    //history management

    //editing logic

    vc.setImage(emap);

    p.setup = function(){
        p.noSmooth();
        createCheckerboard();
        drawCheckerboard();
        drawEmap();
        history.push();
    }

    p.draw = function(){
        handleFlags();

        //handle resize

        handlePointerInput();
        editPixelColor();

        drawCheckerboard();
        drawEmap();
    }

    function handleFlags(){

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
        
    }

    function handleResize(){
        //resize canvas

        //create new checkerboard

        //rescale emap / VC?
    }

    function handlePointerInput(){
        if(pointerState.isDownP5 === pointerState.wasDownP5 || pointerState.p5Ignore){
            //pointer state not changed since last frame, or forcing p5 to ignore pointer (eg during scroll / zoom)
            return;
        }

        if(pointerState.isDownP5){
            //on pointer down
            const pLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);
            editPixel = vc.getPixelAtLocalPoint(pLocal.x, pLocal.y);
        }
        else{            
            //on pointer up

            if(editPixel){
                history.push();
                editPixel = null;
            }            
        }

        pointerState.wasDownP5 = pointerState.isDownP5;
    }

    function editPixelColor(){
        //no active pixel, or else forcing p5 to ignore pointer changes
        if(!editPixel || pointerState.p5Ignore) return;

        //pixel center coordinates in vc space
        const pixelX = editPixel.x + vc.imageScale / 2;
        const pixelY = editPixel.y + vc.imageScale / 2;

        //pointer location in vc space
        const {pointerX:x, pointerY:y} = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);

        let angle = Math.atan2(pointerY - pixelY, pointerX - pixelX);
        
        //handle snap behavior
        if(/* snap enabled */){
            //round to nearest interval
        }

        const vectorColor = colorFromAngle(angle);

        vc.setPixelColor(editPixel.x, editPixel.y, vectorColor);

    }

}