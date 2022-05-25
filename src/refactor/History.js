
export class History{

    static MAX_LENGTH = 20;
    steps;
    currentIndex;
    p5;
    image;

    /**
     * instantiate an empty History object
     * 
     * 
     * @param {p5Image} pImage the p5 image for this history to track ; to assign a new image after initialization, use History.track
     */
    constructor(pImage){
        this.steps = [];
        this.currentIndex = 0;
        this.image = pImage;
    }

    //copy p5 pixels array to a normal js array
    pixelArrayClone(p5PixelsArray){
        const arr = [];
        for(const i of p5PixelsArray){
            arr.push(i);
        }
        return arr;
    }

    //set p5 pixels array from a previously cloned array
    pixelArraySet(p5PixelsArray, arr){
        if(p5PixelsArray.length !== arr.length){
            console.log(`warning - js array length (${arr.length}) does not match p5 pixel array length (${pixels.length})`);
        }

        for(let i = 0; i < p5PixelsArray.length && i < arr.length; i++){
            p5PixelsArray[i] = arr[i];
        }
    }

    /**
     * TODO : implement recolor ; see old version ; i think just for redrawing vectors?
     * @param {number} n number of steps to traverse
     */
    step(n){
        this.currentIndex = Math.min(this.steps.length - 1, Math.max(this.currentIndex + n));
        this.image.loadPixels();
        this.pixelArraySet(this.pImage.pixels, this.steps[this.currentIndex]);
        this.image.updatePixels();
        
        // recolor
    }

    /**
     * push the current pixel data of the tracked image onto the history stack
     * 
     * if not at the most recent entry, history entries after the current position will be deleted before push
     * 
     * if history stack is at maximum length, the oldest entry will be deleted before push
     */
    push(){
        this.image.loadPixels();

        const current = this.steps[this.currentIndex];
        const changed = current.some((val, i) => val !== this.image.pixels[i]);
        if(!changed) return;

        const pixels = this.pixelArrayClone(this.image.pixels);

        if(this.steps.length > 0 && this.currentIndex < this.steps.length - 1){
            this.steps.splice(this.currentIndex + 1);
        }

        else if(this.steps.length >= this.MAX_LENGTH){
            this.steps.splice(0, 1);
            this.currentIndex--;
        }

        this.steps.push(pixels);

        if(this.steps.length > 1) this.currentIndex++;
    }

    /**
     * wipes history entries and sets current index to zero
     */
    erase(){
        this.steps = [];
        this.currentIndex = 0;
    }

    /**
     * erases current history stack and sets tracking to a new p5 image
     * @param {p5Image} p5Image the new p5 image to track
     */
    track(p5Image){
        this.erase();
        this.image = p5Image;
    }
}