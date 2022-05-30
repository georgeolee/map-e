import { VirtualCanvas } from "./VirtualCanvas";
import { VirtualCanvasVisualizer } from "./VirtualCanvasVisualizer";
import * as COLOR from './colors';
import { settings } from "./globals";
import { History } from "./History";

export function sketch(p){

    let emap = p.createImage(settings.size.x, settings.size.y);
    let bg = null;

    const vc = new VirtualCanvas(p);
    const viz = new VirtualCanvasVisualizer(vc);
    
    const history = new History(emap);

    //pointer up / down handling
    //  p5 down
    //  p5 click
    //  p5 x, y
    //  
    //  down / up / x / y

    vc.setImage(emap);

    p.setup = function(){

    }

    p.draw = function(){

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
        if(/* editing pixel color */){ 
            viz.outlinePixel(/* emap, active pixel x, active pixel y */);
        }

        //draw pixel highlight?
        else if(/* mouse over p5 canvas */){
            const mLocal = vc.getWorldToLocalPoint(p.mouseX, p.mouseY);  // mouse transformed position
            const pix = vc.getPixelAtLocalPoint(mLocal.x, mLocal.y);
            if(pix) viz.highlightPixel(emap, pix.x, pix.y);
        }


        //draw directions
        viz.drawPixelDirections(emap);

        p.pop();
    }

    function loadEmap(){

    }

    function exportEmap(){
        
    }
}