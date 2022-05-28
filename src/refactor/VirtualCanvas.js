//represents the scrollable, zoomable image editing area that the user interacts with

//leave the actual interaction in sketch – draw loop, basically

//but define how stuff works / gets handled here


//BIG TODO - test transformation matrices ; do they work as expected?

import * as COLOR from './colors';
import { settings } from './globals';

export class VirtualCanvas{

    p5;    

    width;
    height;

    zoom;   // don't do here, but square the value that gets passed into this ( zoomLevel**2 ) for more linear feel
    scroll;

    image;
    background;

    imageOffset;
    imageScale;

    backgroundOffset;
    backgroundScale;

    constructor(p5Instance){
        this.p5 = p5Instance;

        this.zoom = 1;
        this.scroll = {
            x:0,
            y:0,
        }

        this.imageScale = 1;
        this.imageOffset = {
            x:0,
            y:0,
        }

    }

    setImage(pImage){
        this.image = pImage;
        this.imageScale = Math.min(this.p5.width / this.image.width, this.p5.height / this.image.height);
        // this.imageOffset.x = -this.image.width/2 * this.imageScale;
        // this.imageOffset.y = -this.image.height/2 * this.imageScale;

        //TODO: THIS - set width & height according to image aspect & canvas size
        //TEST: is this correct?
        const aspect = this.image.width / this.image.height;
        this.width = aspect > 1 ? this.p5.width : this.p5.width * aspect;
        this.height = aspect > 1 ? this.p5.height / aspect : this.p5.height;
    }

    setBackground(pImage){
        this.background = pImage;
        this.backgroundScale = Math.min(this.p5.width / this.background.width, this.p5.height / this.background.height);
        // this.backgroundOffset.x = -this.background.width/2 * this.backgroundScale;
        // this.backgroundOffset.y = -this.background.height/2 * this.backgroundScale;
    }


    //transformation matrix that represents this objects position & scale in world (p5 canvas element) space
    //use this one to apply transforms when drawing virtualcanvas within the p5canvas space
    getLocalToWorldMatrix(){
        

        //TODO: which of these is correct? apply image scale elsewhere, if possible... i think that's the correct way; make this more reusable

        // const scale = this.zoom * this.imageScale;          //final scale accounting for zoom level & image fullscreen size

        const scale = this.zoom;          //scale accounting for zoom level ; image scale applied elsewhere, wherever it gets displayed
        const [u, v] = [this.p5.width/2, this.p5.height/2]; //screen half width & height

        return [

            //first column
            scale,
            0,

            //second column
            0,
            scale,

            //third column
            scale * (this.scroll.x - u) + u,
            scale * (this.scroll.y - v) + v

        ];
    }

    //transform matrix that converts world (screen / p5 canvas element ) coordinates to object local coordinates ; the inverse of getLocalToWorldMatrix
    //use this one to convert mouse coordinates from screen space to object space
    getWorldToLocalMatrix(){

        //TODO : same question as above regarding scale
        
        const scale = this.zoom;
        const [u, v] = [this.p5.width/2, this.p5.height/2]; //screen half width & height

        return [

            //first column
            1/scale,
            0,

            //second column
            0,
            1/scale,

            //third column
            -1 * ( this.scroll.x - u + u/scale ),
            -1 * ( this.scroll.y - v + v/scale )
        ];
    }

    //convert from world to local coordinates
    getWorldToLocalPoint(worldX, worldY){
        const M = this.getWorldToLocalMatrix();

        /* M2 = [ worldX, worldY, 1 ]*/

        return {
            x: M[0]*worldX + M[2]*worldY + M[4]*1,
            y: M[1]*worldX + M[3]*worldY + M[5]*1,
        }
    }

    //convert from local to world coordinates
    getLocalToWorldPoint(localX, localY){
        const M = this.getLocalToWorldMatrix();

        /* M2 = [ localX, localY, 1 ]*/

        return {
            x: M[0]*localX + M[2]*localY + M[4]*1,
            y: M[1]*localX + M[3]*localY + M[5]*1,
        }
    }

    //draw image fullsize (at 1x zoom) 
    drawImage(){

        //scale to image size
        // TEST: translate towards canvas center, translate back by half image size ?
        const M = [
            this.imageScale,
            0,

            0,
            this.imageScale,

            // this.imageScale * (this.p5.width/2 - this.image.width/2),
            // this.imageScale * (this.p5.height/2 - this.image.height/2)

            0,
            0
        ]
        this.p5.push();
        this.p5.applyMatrix(...M);
        this.p5.image(this.image, 0, 0);
        this.p5.pop();
    }

    drawBackground(){

        //scale to bg size
        // TEST: translate towards canvas center, translate back by half bg size ?
        const M = [
            this.backgroundScale,
            0,

            0,
            this.backgroundScale,

            // this.backgroundScale * (this.p5.width/2 - this.background.width/2),
            // this.backgroundScale * (this.p5.height/2 - this.background.height/2)

            0,
            0,
        ]
        this.p5.push();
        this.p5.applyMatrix(...M);
        this.p5.image(this.background, 0, 0);
        this.p5.pop();
    }

    drawGrid(){

        const M = [
            this.imageScale,
            0,

            0,
            this.imageScale,

            this.imageScale * (this.p5.width/2 - this.width/2),
            this.imageScale * (this.p5.height/2 - this.height/2)
        ]

        const c = COLOR.GRID[settings.editorMode];
        const gridColor = this.p5.color(c.r, c.g, c.b, c.a);
        this.p5.push();
        this.applyMatrix(...M);
        this.p5.stroke(gridColor);
        this.p5.strokeWeight(settings.gridWeight/(this.zoom * this.imageScale));
        for(let x = 0; x < this.image.width * this.imageScale; x += this.imageScale){
            this.p5.line(x, 0, x, this.height);
        }
        for(let y = 0; y < this.image.height * this.imageScale; y += this.imageScale){
            this.p5.line(0, y, this.width, y);
        }
        this.p5.pop();
    }

    /**
     * Get the image pixel corresponding to local coordinates
     * @param {number} localX 
     * @param {number} localY 
     */
    getPixelAtLocalPoint(localX, localY){
        const [halfWidth, halfHeight] = [this.imageScale * this.image.width/2, this.imageScale * this.image.height/2];
        
        if(Math.abs(localX - halfWidth) > halfWidth || Math.abs(localY - halfHeight) > halfHeight) return null; //outside of image bounds

        return {
            x: Math.floor(localX / this.imageScale),
            y: Math.floor(localY / this.imageScale),
        }
    }

    /**
     * 
     * @param {number} pixelX pixel coordinate
     * @param {number} pixelY pixel coordinate
     * @param {object} rgba an { r: number, g: number, b: number, a: number } object
     */
    setPixelColor(pixelX, pixelY, rgba){
        if(pixelX < 0 || pixelY < 0 || pixelX > this.image.width -1 || pixelY > this.image.height - 1) throw new Error('VirtualCanvas.setPixelColor(): pixel coordinates out of range');
        this.image.loadPixels();
        const i = 4 * (this.image.width * pixelY + pixelX);
        this.image.pixels[i] = rgba.r;
        this.image.pixels[i+1] = rgba.g;
        this.image.pixels[i+2] = rgba.b;
        this.image.pixels[i+3] = rgba.a;
    }

    //THINGS THAT DO *NOT* GO HERE -------

    // actually loading image files from url
    // export
    // background opacity bake
    // checkerboard background for whole p5 canvas


    //-----------------------------------

    //THINGS THAT GO HERE --------


    //NOTE : provide p5 images to setter functions ; handle loading elsewhere outside of class


    //draw image

    //draw grid

    //handle transformations

    //get mouse virtual position 
    // i.e - canvas element space >> virtual canvas space

    //detect if mouse is over virtual canvas or not

    //get image pixel from coords, mouse

    //set image pixel color

    //transformations from zoom / scroll


    //------- TODO  V



    //visualize pixel directions

    //draw active / hover pixel

}