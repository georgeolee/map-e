//represents the scrollable, zoomable image editing area that the user interacts with

//leave the actual interaction in sketch – draw loop, basically

//but define how stuff works / gets handled here

export class VirtualCanvas{

    p5;
    image;
    width;
    height;

    zoom;
    scroll;
    imageOffset;
    imageScale;

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

    //THINGS THAT DO *NOT* GO HERE -------

    // actually loading image files from url
    // export
    // background opacity bake
    // checkerboard background for whole p5 canvas


    //-----------------------------------

    //THINGS THAT GO HERE --------

    //set new image & dimensions
    // > size to fit p5 canvas

    //set new background & dimensions
    // > size to fit p5 canvas


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