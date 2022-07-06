//represents the scrollable, zoomable image editing area that the user interacts with




export class VirtualCanvas{

    p5;    

    width;
    height;

    zoom;   // don't do here, but square the value that gets passed into this ( zoomLevel**2 ) for more linear feel
    scroll;

    image;    

    imageScale;    


    //TESTING
    localToWorldMatrix;
    worldToLocalMatrix;

    constructor(p5Instance){
        this.p5 = p5Instance;

        this.zoom = 1;
        this.scroll = {
            x:0,
            y:0,
        }

        this.imageScale = 1;

        //TESTING
        this.localToWorldMatrix = [1,0,0,1,0,0];
        this.worldToLocalMatrix = [1,0,0,1,0,0];
    }

    setImage(pImage){
        this.image = pImage;

        const aspect = this.image.width / this.image.height;

        this.imageScale = this.getPixelRatio(this.image);

        //TODO: THIS - set width & height according to image aspect & canvas size
        //TEST: is this correct?
        
        this.width = aspect > 1 ? this.p5.width : this.p5.width * aspect;
        this.height = aspect > 1 ? this.p5.height / aspect : this.p5.height;
    }

    getPixelRatio(pImage){
        return pImage.width / pImage.height >= this.p5.width / this.p5.height ? //compare image & canvas aspect ratios
            this.p5.width / pImage.width :  // image AR greater / equal : fit image width in canvas
            this.p5.height / pImage.height; // canvas AR greater : fit image height in canvas
    }


    /**
     * get the transformation matrix that represents this object's position & scale in world (ie p5 canvas) space
     * 
     * use this one to apply transforms when drawing VirtualCanvas within the p5canvas space
     * 
     * @returns the matrix as a number array 
     */
    getLocalToWorldMatrix(){
        

        //TODO: which of these is correct? apply image scale elsewhere, if possible... i think that's the correct way; make this more reusable

        // const scale = this.zoom * this.imageScale;          //final scale accounting for zoom level & image fullscreen size

        const scale = this.zoom;          //scale accounting for zoom level ; image scale applied elsewhere, wherever it gets displayed
        const [u, v] = [this.p5.width/2, this.p5.height/2]; //screen half width & height

        //first column
        this.localToWorldMatrix[0] = scale;
        this.localToWorldMatrix[1] = 0;

        //second column
        this.localToWorldMatrix[2] = 0;
        this.localToWorldMatrix[3] = scale;

        //third column
        this.localToWorldMatrix[4] = scale * (this.scroll.x - u) + u;
        this.localToWorldMatrix[5] = scale * (this.scroll.y - v) + v;        

        return this.localToWorldMatrix;
    }

    

    /**
     * get the transform matrix that converts world (screen / p5 canvas element ) coordinates to object local coordinates ; the inverse of getLocalToWorldMatrix
     * 
     * use this one to convert mouse coordinates from screen space to object space
     * 
     * @returns the matrix as a number array
     */
    getWorldToLocalMatrix(){

        //TODO : same question as above regarding scale
        
        const scale = this.zoom;
        const [u, v] = [this.p5.width/2, this.p5.height/2]; //screen half width & height

        this.worldToLocalMatrix[0] = 1 / scale;
        this.worldToLocalMatrix[1] = 0;
        this.worldToLocalMatrix[2] = 0;
        this.worldToLocalMatrix[3] = 1 / scale;
        this.worldToLocalMatrix[4] = -1 * (this.scroll.x - u + u/scale);
        this.worldToLocalMatrix[5] = -1 * (this.scroll.y - v + v/scale);


        return this.worldToLocalMatrix;
    }

    //convert from world to local coordinates (multiplies [x, y] by world to local matrix)
    getWorldToLocalPoint(worldX, worldY){
        const M = this.getWorldToLocalMatrix();

        /* M2 = [ worldX, worldY, 1 ]*/

        return {
            x: M[0]*worldX + M[2]*worldY + M[4]*1,
            y: M[1]*worldX + M[3]*worldY + M[5]*1,
        }
    }

    //convert from local to world coordinates (multiplies [x,y] by local to world matrix)
    getLocalToWorldPoint(localX, localY){
        const M = this.getLocalToWorldMatrix();

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

    scaleFromWorldPoint(scale, origin){
        const M = this.getWorldToLocalMatrix();
    }

}