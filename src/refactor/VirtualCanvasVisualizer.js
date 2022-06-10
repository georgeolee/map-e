
import * as COLOR from './colors';
import { settings } from './globals';
import { angleFromColorRG, isNeutralColor } from './vectorEncoding';
import { PIXEL_OUTLINE_WIDTH, PIXEL_VECTOR_LENGTH, PIXEL_VECTOR_THICKNESS } from './constants';

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
        const [p5, image] = [this.vc.p5, this.vc.image]
        const c = COLOR.GRID[settings.editorMode];
        p5.push();
        p5.applyMatrix(...this.#getScaleMatrix(this.vc.imageScale));
        p5.stroke(c.r, c.g, c.b, c.a);

        //weight proportional to image pixel size
        p5.strokeWeight(settings.gridWeight)

        //already scaled to image pixel size via applymatrix - just step by 1 image pixel at a time
        for(let x = 0; x <= image.width; x ++){
            p5.line(x, 0, x, image.height);
        }

        for(let y = 0; y <= image.height; y ++){
            p5.line(0, y, image.width, y);
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
        const p5 = this.vc.p5;
        const i = 4 * (py * pimg.width + px); //first pixel array index
        // console.log(`highlighPixel: pimg: ${pimg}`)
        // console.log(`highlighPixel: i: ${i}`)
        pimg.loadPixels();
        
        p5.push();
        p5.applyMatrix(...this.#getScaleMatrix(this.vc.getPixelRatio(pimg)));
        p5.noStroke();

        let c = COLOR.ACTIVE_PIXEL[settings.editorMode];
        // console.log(`highlightPixel: blue: ${pimg.pixels[i+2]}\talpha: ${pimg.pixels[i+3]}`)
        if(isNeutralColor(pimg.pixels[i+2], pimg.pixels[i+3])){
            const bg = COLOR.BG_A[settings.editorMode];
            p5.fill(bg.r, bg.g, bg.b, bg.a);
            p5.rect(px, py, 1, 1);
            c = COLOR.GRID[settings.editorMode];
        }
        
        p5.fill(c.r, c.g, c.b, c.a);
        p5.rect(px, py, 1, 1);
        p5.pop();
    }

    outlinePixel(pimg, px, py){
        const p5 = this.vc.p5;
        p5.push();
        p5.applyMatrix(...this.#getScaleMatrix(this.vc.getPixelRatio(pimg)));
        const c = COLOR.ACTIVE_PIXEL[settings.editorMode];
        p5.noFill();
        p5.stroke(c.r, c.g, c.b, c.a);
        const thickness = PIXEL_OUTLINE_WIDTH / (this.vc.zoom * this.vc.getPixelRatio(pimg));   // divide outline width by scale for constant thickness at different zoom levels
        const size = Math.max(0, 1 - thickness); // width & height of outline rect ; don't run into negative values if thickness is really big for some reason
        p5.strokeWeight(thickness);
        p5.rect(px + thickness/2, py + thickness/2, size, size);
        p5.pop();
    }

    drawPixelDirections(pimg){
        const p5 = this.vc.p5;
        p5.push();
        p5.applyMatrix(...this.#getScaleMatrix(this.vc.getPixelRatio(pimg)));

        //THICKNESS - WHICH?
        // const thickness = PIXEL_VECTOR_THICKNESS / (this.vc.zoom * this.vc.getPixelRatio(pimg));
        const thickness = PIXEL_VECTOR_THICKNESS / this.vc.getPixelRatio(pimg);
        p5.strokeWeight(thickness);

        pimg.loadPixels();
        for(let i = 0; i < pimg.pixels.length; i+= 4){
            
            //skip neutral pixels (as defined in vectorEncoding.js)
            if(isNeutralColor(pimg.pixels[i+2], pimg.pixels[i+3])) continue;

            //draw pixel vector
            const [px, py] = [(i / 4) % pimg.width, (i / 4) / pimg.width];      // pixel x and y
            const angle = angleFromColorRG(pimg.pixels[i], pimg.pixels[i+1]);   // encoded angle
            const [vx, vy] = [PIXEL_VECTOR_LENGTH * Math.cos(angle), PIXEL_VECTOR_LENGTH * Math.sin(angle)];    //x & y components of a vector w PIXEL_VECTOR_LENGTH rotated towards angle
            p5.stroke(pimg.pixels[i], pimg.pixels[i+1], pimg.pixels[i+2]);
            p5.line(px, py, px + vx, py + vy);

            //draw dot at pixel center
            p5.stroke(COLOR.PIXEL_CENTER.r, COLOR.PIXEL_CENTER.g, COLOR.PIXEL_CENTER.b);
            p5.point(px + 0.5, py + 0.5);
        }
        p5.pop();
    }

}