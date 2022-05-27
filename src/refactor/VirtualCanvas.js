//represents the scrollable, zoomable image editing area that the user interacts with

//leave the actual interaction in sketch – draw loop, basically

//but define how stuff works / gets handled here


//BIG TODO - test transformation matrices ; do they work as expected?

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
        this.imageOffset.x = -this.image.width/2 * this.imageScale;
        this.imageOffset.y = -this.image.height/2 * this.imageScale;

        //TODO: THIS    
        this.width = Math.min()
    }

    setBackground(pImage){
        this.background = pImage;
        this.backgroundScale = Math.min(this.p5.width / this.background.width, this.p5.height / this.background.height);
        this.backgroundOffset.x = -this.background.width/2 * this.backgroundScale;
        this.backgroundOffset.y = -this.background.height/2 * this.backgroundScale;
    }


    //transformation matrix that represents this objects position & scale in world (p5 canvas element) space
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
    //use this one for example to get the convert mouse coordinates from screen space to object space
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

        /* M2 = [
                worldX, 
                worldY, 
                1
            ]*/

        return {
            x: M[0]*worldX + M[2]*worldY + M[4]*1,
            y: M[1]*worldX + M[3]*worldY + M[5]*1,
        }
    }

    //convert from local to world coordinates
    getLocalToWorldPoint(localX, localY){
        const M = this.getLocalToWorldMatrix();

        /* M2 = [
                localX, 
                localY, 
                1
            ]*/

        return {
            x: M[0]*localX + M[2]*localY + M[4]*1,
            y: M[1]*localX + M[3]*localY + M[5]*1,
        }
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

    //visualize pixel directions

    //draw active / hover pixel

}