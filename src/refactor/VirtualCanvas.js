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
    hotPinch;       //a pinch zoom transformation still in progress

                    //... when pinch zoom finishes, bake transformations : 
                    //          first scale, -> this.transform.applyToSelf(hotPinch)

    pinching;


    /**
     * animated matrix values from Canvas gesture / spring hooks
     */
    animated;

    constructor(p5Instance){
        this.p5 = p5Instance;

        this.zoom = 1;

        this.imageScale = 1;

        //TESTING

        this.transform = new Transform();

        this.hotPinch = new Transform();      

        this.pinching = false;

        this.animated = {
            matrix: this.getTransformMatrix(),
            inverseMatrix: this.getInverseTransformMatrix(),
            stop: null, //Canvas attaches a callback here for stopping animation
        }


    }

    setImage(pImage){
        this.image = pImage;
        this.imageScale = this.getPixelRatio(this.image);
    }

    getPixelRatio(pImage){
        return pImage.width / pImage.height >= this.p5.width / this.p5.height ? //compare image & canvas aspect ratios
            this.p5.width / pImage.width :  // image AR greater / equal : fit image width in canvas
            this.p5.height / pImage.height; // canvas AR greater : fit image height in canvas
    }


    //convert from world to local coordinates (multiplies [x, y] by world to local matrix)
    getWorldToLocalPoint(worldX, worldY, useAnimatedMatrix = false){

        const M = useAnimatedMatrix ? this.animated.inverseMatrix : this.getInverseTransformMatrix()

        /* treat point as a 1x3 matrix with padding 1  ---->    worldX, 
                                                                worldY, 
                                                                1 
        */

        return {
            x: M[0]*worldX + M[2]*worldY + M[4]*1,
            y: M[1]*worldX + M[3]*worldY + M[5]*1,
        }
    }

    //convert from local to world coordinates (multiplies [x,y] by local to world matrix)
    getLocalToWorldPoint(localX, localY, useAnimatedMatrix = false){

        const M = useAnimatedMatrix ? this.animated.matrix : this.getTransformMatrix()

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



    /**
     * 
     * @param {number} s scale factor
     * @param {number} x scale origin x
     * @param {number} y scale origin y
     */
    scaleFromPoint(s, x, y){

        this.hotPinch.setToTranslation(x, y).scale(s).translate(-x,-y);
        if(!this.pinching){ //if not pinching, bake into current transformation

            this.transform.applyToSelf(this.hotPinch);
            this.hotPinch.setToIdentity()
        }

    }



    translate(x, y){
        this.transform.translate(x, y)        
    }

    /**
     * Starts a pinch. While pinching, multiple calls to scaleFromPoint() are *not* cumulative. 
     * Instead, subsequent calls overwrite the current pinch, which is combined with the overall transform / inverse transform matrices.
     * 
     * Calling endPinch() bakes in the current pinch transformation
     */
    startPinch(){
        this.pinching = true;
    }

    /**
     * Bakes in the current pinch transformation
     */
    endPinch(){
        this.pinching = false;
        this.transform.applyToSelf(this.hotPinch);
        this.hotPinch.setToIdentity();
    }

    /**
     * get the transformation matrix that represents this object's position & scale in world (ie p5 canvas) space
     * 
     * use this one to apply transforms when drawing VirtualCanvas within the p5canvas space
     * 
     * @returns {number[]}the matrix as a number array 
     */
    getTransformMatrix(){
        if(!this.pinching) return this.transform.m;

        return Transform.matrixMult(this.transform.m, this.hotPinch.m)
    }

    /**
     * get the transform matrix that converts world (screen / p5 canvas element ) coordinates to object local coordinates ; the inverse of getLocalToWorldMatrix
     * 
     * use this one to convert mouse coordinates from screen space to object space
     * 
     * @returns {number[]} the matrix as a number array
     */
    getInverseTransformMatrix(){
        if(!this.pinching) return this.transform.i;

        // NOTE - inverse order for multiplication 
        return Transform.matrixMult(this.hotPinch.i, this.transform.i)
    }

    /**
     * get the current canvas scale
     * @param {boolean} includeHotPinch - if true, factor in the result of any ongoing pinch gesture; defaults to true
     * @returns {number} scale
     */
    getScale(includeHotPinch = true){
        return includeHotPinch ? this.getTransformMatrix()[0] : this.transform.m[0]
    }

    getAnimatedScale(){
        return this.animated.matrix[0];
    }

    getTranslation(){
        return this.getTransformMatrix().slice(4, 6) //get x & y components of the translation
    }

    resetTransform(){
        this.transform.setToIdentity();
        this.animated.matrix = this.transform.m;
        this.animated.inverseMatrix = this.transform.i;
        this.animated.stop?.();
    }

}