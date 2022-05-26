
export class Transform{

    zoom;
    translation;
    imageOffset;
    imageScale;
    p5;


    constructor(p5Instance){
        this.p5 = p5Instance;
        this.zoom = 1;
        this.translation = {
            x:0,
            y:0,
        }

        this.imageScale = 1;
        this.imageOffset = {
            x:0,
            y:0,
        }
    }


    /*


    transform info
        > translation
        > zoom

        > image scale
        > image offset

    history data        

    other settings
        > snap
        > size
        > image url
        > background url, alpha
        > display options






    */

}