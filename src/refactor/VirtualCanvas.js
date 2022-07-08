//represents the scrollable, zoomable image editing area that the user interacts with

import { Transform } from "./Transform";

import { clip, settings } from "./globals";


export class VirtualCanvas{

    p5;    

    width;
    height;

    image;    

    imageScale;    


    //transformations
    transform;      //current base tranformation with previous scales & translatations baked in
    hotScale;       //a pinch zoom transformation still in progress
    hotTranslation; //a translation applied while pinch zoom is still in progress

                    //... when pinch zoom finishes, bake transformations : 
                    //          first scale, then translation -> this.transform.applyToSelf(hotScale).applyToSelf(hotTranslation)

    //where to track pinch status?
    pinching;



    constructor(p5Instance){
        this.p5 = p5Instance;

        this.zoom = 1;

        this.imageScale = 1;

        //TESTING

        this.transform = new Transform();

        this.hotScale = new Transform();      
        this.hotTranslation = new Transform();

        this.pinching = false;


        /*
        *   pinch zoom centered at a point
        *
        *       keep track of multiple transformations:
        *       
        *
        *       base transform TB
        * 
        *       new transform z1 -> offset towards pinch center
        *       new transform zp -> pinch scale factor
        *       new transform z2 -> offset back away from pinch center
        * 
        *       new transform tp -> (possibly) -> pan / scroll / translation during pinch (other than offset to center)
        *
        * 
        *       while pinch zooming, keep track of all, and compute final result (without mutating anything yet)
        *           - zp changing
        *           - tp possibly changing
        *       
        *       when pinch zoom is released, consolidate all into a single transformation and update TB with the result
        * 
        * 
        *       
        * 
        * 
        */ 

    }

    setImage(pImage){
        this.image = pImage;

        const aspect = this.image.width / this.image.height;

        this.imageScale = this.getPixelRatio(this.image);

    }

    getPixelRatio(pImage){
        return pImage.width / pImage.height >= this.p5.width / this.p5.height ? //compare image & canvas aspect ratios
            this.p5.width / pImage.width :  // image AR greater / equal : fit image width in canvas
            this.p5.height / pImage.height; // canvas AR greater : fit image height in canvas
    }


    //convert from world to local coordinates (multiplies [x, y] by world to local matrix)
    getWorldToLocalPoint(worldX, worldY){

        const M = this.getInverseTransformMatrix()

        /* M2 = [ worldX, worldY, 1 ]*/

        return {
            x: M[0]*worldX + M[2]*worldY + M[4]*1,
            y: M[1]*worldX + M[3]*worldY + M[5]*1,
        }
    }

    //convert from local to world coordinates (multiplies [x,y] by local to world matrix)
    getLocalToWorldPoint(localX, localY){
        // const M = this.getLocalToWorldMatrix();

        const M = this.getTransformMatrix()

        /* M2 = [ localX, localY, 1 ]*/

        return {
            x: M[0]*localX + M[2]*localY + M[4]*1,
            y: M[1]*localX + M[3]*localY + M[5]*1,
        }
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
        this.image.updatePixels();
    }


    //new stuff ----------------------

    scaleFromPoint(s, x, y){
        //if(!this.pinching) consolidate & apply right away -> -translate, scale, translate        .... btw... do i have the order right? is it - S + or + S - ?
        //
        //  .... do the stuff
        //  
        //  ....    this.transform.applyToSelf( the transformation )

        // this.hotScale.setToTranslation(x, y);
        // this.hotScale.m[0] = s;
        // this.hotScale.m[3] = s;
        // this.hotScale.translate(-x, -y)

        const currentScale = this.transform.m[0];
        s = clip(s, settings.zoom.min / currentScale, settings.zoom.max / currentScale);

        this.hotScale.setToTranslation(x, y).scale(s).translate(-x,-y);

        // this.hotScale.setToTranslation(x - u, y - v).scale(s).translate(-x + u,-y +v);


        if(!this.pinching){

            this.transform.applyToSelf(this.hotScale);
            this.hotScale.setToIdentity()

        }

    }



    //on second thought .... is tracking hotTranslation necessary? test, think about this
    translate(x, y){
        //similar to above

        //if(!pinching) this.transform.translate(x, y) ... apply right away
        // ...  return

        //else

        //apply cumulative translations to hotTranslation - get scale from pinch ?
        //
        //  note~ make sure to set back to identity when pinch finishes (same goes for hotScale)

        //this.hotScale.translate(x, y)

        //CURRENT
        this.transform.translate(x, y)

        //TEST
        // if(!this.pinching){
        //     this.transform.translate(x, y);
        //     return;
        // }

        // this.hotTranslation.translate(x, y);

    }

    startPinch(){
        this.pinching = true;
    }

    endPinch(){
        this.pinching = false;

        //CURRENT
        this.transform.applyToSelf(this.hotScale);

        //TEST
        // this.transform.applyToSelf(this.hotScale).applyToSelf(this.hotTranslation);

        this.hotScale.setToIdentity();
        this.hotTranslation.setToIdentity();

    }

    /**
     * get the transformation matrix that represents this object's position & scale in world (ie p5 canvas) space
     * 
     * use this one to apply transforms when drawing VirtualCanvas within the p5canvas space
     * 
     * @returns the matrix as a number array 
     */
    getTransformMatrix(){
        if(!this.pinching) return this.transform.m;

        //else

        //return Transform.mult(transform.m, hotScale.m) ... translation?

        //CURRENT
        return Transform.matrixMult(this.transform.m, this.hotScale.m)

        //TEST
        // return Transform.matrixMult(this.transform.m, this.hotScale.m, this.hotTranslation.m)
    }

    /**
     * get the transform matrix that converts world (screen / p5 canvas element ) coordinates to object local coordinates ; the inverse of getLocalToWorldMatrix
     * 
     * use this one to convert mouse coordinates from screen space to object space
     * 
     * @returns the matrix as a number array
     */
    getInverseTransformMatrix(){
        if(!this.pinching) return this.transform.i;

        //else

        // NOTE - inverse order for multiplication 
        //return Transform.mult(hotScale.i, transform.i) ... translation?

        //CURRENT
        return Transform.matrixMult(this.hotScale.i, this.transform.i)

        //TEST
        // return Transform.matrixMult(this.hotTranslation.i, this.hotScale.i, this.transform.i);

    }

    /**
     * get the current canvas scale
     * @param {boolean} includeHotPinch - if true, factor in the scale of any ongoing pinch gesture; defaults to true
     * @returns 
     */
    getScale(includeHotPinch = true){
        return includeHotPinch ? this.getTransformMatrix()[0] : this.transform.m[0]
    }

    getTranslation(){
        return this.getTransformMatrix().slice(4, 6) //get x & y components of the translation
    }

}