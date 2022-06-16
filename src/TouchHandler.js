export class TouchHandler{


    tpCache;
    touches;

    
    emulatePointer;

    threshold;

    onPinchZoom2F;
    onSwipe2F;

    onTouchCountChange;

    cleanup;

    log;    // print stuff for debugging on mobile


    //work on this
    zoomStartDist;
    zoomStarted;
    onPinchZoomFinish2F

    zoomPoints;

    constructor(){

        this.tpCache = {};
        this.touches = 0;


        this.emulatePointer = true;

        this.threshold = {
            pinch : 0,
            swipe : 0,
            rotate : 0,
        }

        this.cleanup = [];

        this.log = '';

        this.zoomStarted = false;


    }

    attach(element){


        const boundStart = this.handleTouchStart.bind(this);
        const boundMove = this.handleTouchMove.bind(this);
        const boundEnd = this.handleTouchEnd.bind(this);


        element.addEventListener('touchstart', boundStart);
        element.addEventListener('touchmove', boundMove);
        element.addEventListener('touchend', boundEnd);
        element.addEventListener('touchcancel', boundEnd);

        //WEIRD THIS STUFF GOING ON - use bound function?

        // element.addEventListener('touchstart', this.handleTouchStart);
        // element.addEventListener('touchmove', this.handleTouchMove);
        // element.addEventListener('touchend', this.handleTouchEnd);
        // element.addEventListener('touchcancel', this.handleTouchEnd);

        this.cleanup.push(
            () => element.removeEventListener('touchstart', boundStart),
            () => element.removeEventListener('touchmove', boundMove),
            () => element.removeEventListener('touchend', boundEnd),
            () => element.removeEventListener('touchcancel', boundEnd),
        );
    }

    // detach(element){
    detach(){
        // element.removeEventListener('touchstart', this.handleTouchStart);
        // element.removeEventListener('touchmove', this.handleTouchMove);
        // element.removeEventListener('touchend', this.handleTouchEnd);
        // element.removeEventListener('touchcancel', this.handleTouchEnd);

        for(const fn of this.cleanup){
            fn?.();
        }

        this.cleanup = [];
    }

    handleTouchStart(e){

        this.touches += e.changedTouches.length;
        this?.onTouchCountChange(this.touches);

        switch(e.targetTouches.length){
            case 1:
                if(!this.emulatePointer) e.preventDefault();
                break;

            case 2:       
                
                //zoom start dist MOVED to process2TouchMove

                this.log='2222222222222222222 START'         
                break;

            default:
                break;
        }

        //add touch point to cache 
        for(const t of e.changedTouches){

            // shallow copy of original touch obj, so can compare old position after move
            // using for...in bc seems like property spread ({...t}) only works for object literals ?
            const cp = {};
            for(const p in t){  
                cp[p] = t[p];       
            }

            // console.log(cp)
            this.tpCache[t.identifier] = cp;    
                                                
        }
    }

    handleTouchMove(e){
        switch(e.changedTouches.length){
            case 1:
                if(!this.emulatePointer) e.preventDefault();

                this.process1TouchMove(e);                
                break;

            case 2:
                this.process2TouchMove(e);
                break;

            default:
                break;
        }

        //update cached touch points
        for(const t of e.changedTouches){
            
            //get the cached point (or add it if it was missed somehow)
            const cp = this.tpCache[t.identifier] ?? {};
            this.tpCache[t.identifier] ??= cp
                            
            //update it
            for(const p in t){
                cp[p] = t[p];
            }
        }

        

    }

    handleTouchEnd(e){

        this.touches -= e.changedTouches.length;
        this?.onTouchCountChange(this.touches);

        //finished pinch zoom?
        if(this.zoomStarted){
            this.zoomStarted = false;
            this?.onPinchZoomFinish2F();
        }

        switch(e.changedTouches.length){
            case 1:
                if(!this.emulatePointer) e.preventDefault();
                break;

            case 2:     
                this.log='222222ENDDDDDDDDO'           
                break;

            default:
                break;
        }

        //delete touch point from cache
        for(const touch of e.changedTouches){
            if(this.tpCache[touch.identifier]) delete this.tpCache[touch.identifier]; 
        }
    }

    process1TouchMove(e){
        //just leave 1 touch handling to pointer events for now
        this.log = '1touch'
    }

    process2TouchMove(e){        
        if(e.changedTouches.length !== 2) return;

        const [t1, t2] = e.changedTouches;
        const [t1Prev, t2Prev] = [this.tpCache[t1.identifier], this.tpCache[t2.identifier]];

        if(!t1Prev || !t2Prev) return;  // stop if no cached value available

        //delta pos for each touch point since previous cached value
        const d1 = this.getClientDelta(t1, t1Prev);
        const d2 = this.getClientDelta(t2, t2Prev);

        

        //no rotation handling atm

        //dot product of motion vectors
        const dot = d1.x * d2.x + d1.y * d2.y;

        // moving in opposite directions (ish, diff > 90º )
        if(dot < 0){
            

            ///TEST

            //initial touch point dist ; for pinch zoom
            
            if(!this.zoomStarted){
                this.zoomStartDist = Math.sqrt((t1.clientX - t2.clientX)**2 + (t1.clientY - t2.clientY)**2);
            
                //flag zoom start
                this.zoomStarted = true;
            } 

            else{
                //distance between touch points
                const currentTouchDist = Math.sqrt((t1.clientX - t2.clientX)**2 + (t1.clientY - t2.clientY)**2);
                            

                const zoomFactor = currentTouchDist / this.zoomStartDist;

                this.handle2TouchPinchZoom(zoomFactor);
            }
                        

            

            ///END TEST




            //current x, y dist between points
            // const dist = this.getClientDelta(t1, t2);

            //cached x, y dist between points
            // const distPrev = this.getClientDelta(t1Prev, t2Prev);
            
            //change in (squared) straight line dist between points 
            //  >   need this bc dot product alone doesn't say if points are moving closer together or further apart, only that directions are opposite each other
            // const sqDistDelta = (dist.x**2 + dist.y**2) - (distPrev.x**2 + distPrev.y**2);

            // this.handle2TouchPinchZoom(sqDistDelta);
        }

        // moving in same direction (ish, diff <= 90º )
        else{
            this.handle2TouchSwipe(d1, d2);
        }


    }

    /**
     * 
     * @param {Touch} touchB 
     * @param {Touch} touchA 
     * @returns delta BA
     */
    getClientDelta(touchB, touchA){

        if(!touchB || !touchA) return undefined;

        return {
            x: touchB.clientX - touchA.clientX,
            y: touchB.clientY - touchA.clientY,
        }
    }


    getSqDist(x0, y0, x1, y1){
        return (x0 - x1)**2 + (y0 - y1)**2;
    }

    //TODO - change this ; instead of delta dist between movement events,  do current touch dist / touch dist at pinch start
    handle2TouchPinchZoom(zoomFactor){     

        //  crosses threshold?
        // if(Math.abs(zoomFactor) < this.threshold.pinch) return;


        this?.onPinchZoom2F(zoomFactor);

        // const zoomDelta = Math.sign(sqDistDelta)*Math.sqrt(Math.abs(sqDistDelta));


        
        // this?.onPinchZoom2F(zoomDelta);

        this.log = `2pinch\tfactor: ${zoomFactor}`
    }

    /**
     * 
     * @param {vector} d1 x,y motion of first touch point
     * @param {vector} d2 x,y motion of second touch point
     */
    handle2TouchSwipe(d1, d2){
        
        //get an average motion vector from the motion of the 2 touch points
        const meanDelta = {
            x : (d2.x+d1.x) / 2,
            y : (d2.y+d1.y) / 2
        }
        

        //do some kind of threshold check

        this?.onSwipe2F(meanDelta.x, meanDelta.y);

        this.log = `2swipe\tx: ${meanDelta.x}\ty: ${meanDelta.y}`
    }

    handle2TouchRotate(e){
        this.log = '2rotate'
    }
}