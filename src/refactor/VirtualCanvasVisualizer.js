
import * as COLOR from './colors';
import { settings } from './globals';

//class to handle drawing operations for virtual canvas
export class VirtualCanvasVisualizer{
    
    vc;

    constructor(virtualCanvas){
        this.vc = virtualCanvas;        
    }

    #getScaleMatrix(scale){
        return [ scale, 0, 0, scale, 0, 0 ];
    }

    drawGrid(){
        //get vc properties
        const [p5, imageScale, image, zoom] = [this.vc.p5, this.vc.imageScale, this.vc.image, this.vc.zoom]
        const c = COLOR.GRID[settings.editorMode];

        p5.push();
        p5.applyMatrix(...this.#getScaleMatrix(this.vc.imageScale));
        p5.stroke(p5.color(c.r, c.g, c.b, c.a));
        p5.strokeWeight(settings.gridWeight / (zoom * imageScale));
        
        for(let x = 0; x < image.width * imageScale; x += imageScale){
            p5.line(x, 0, x, this.vc.height);
        }

        for(let y = 0; y < image.height * imageScale; y += imageScale){
            p5.line(0, y, this.vc.width, y);
        }

        p5.pop();
    }

    //draw pimg as big as possible within p5 canvas (before taking VC scroll & zoom into account)
    drawImage(pimg){
        const p5 = this.vc.p5;
        p5.push();
        p5.applyMatrix(...this.#getScaleMatrix(this.vc.getPixelRatio(pimg)));
        p5.image(pimg, 0, 0);
        p5.pop();
    }

    highlightPixel(pimg, px, py){

    }

    outlinePixel(pimg, px, py){

    }

}