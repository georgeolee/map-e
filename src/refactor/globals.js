
//settings, flags, and other stuff that should be visible to both p5 sketch and react components

export const appPointer = {
    clientX : 0,
    clientY : 0,

    p5X : 0,
    p5Y : 0,

    isDown : false,
    wasDown : false,

    isDownP5 : false,
    wasDownP5 : false,

    p5Ignore : false,
    overCanvas : false,

    scrollDragging : false,

    dragLastPagePos : {
        x : 0,
        y : 0
    },

}

class Flag{

    isRaised;
    isSticky;

    constructor(isRaised, isSticky = false){
        this.isRaised = isRaised;
        this.isSticky = isSticky;
    }

    raise(){
        this.isRaised = true;
    }

    lower(){
        this.isRaised = false;
    }
}

export const flags = {
    export : new Flag(false),
    recolor : new Flag(false),
    loadEmpty : new Flag(false),
    loadURL : new Flag(false),
    loadBackgroundURL : new Flag(false),
    undo : new Flag(false),
    redo : new Flag(false),

    bakeBackgroundOpacity : new Flag(false),
    dirtyBackground : new Flag(false, true),

    createCheckerboard : new Flag(false),

    isTouch : new Flag(false, true),
}

export const settings = {
    snap : {
        enabled : true,
        angle : 22.5,
    },

    size : {
        x : 16,
        y : 16,
    },

    scroll : {
        x : 0,
        y : 0,
    },

    zoom : {
        level : 1,
        raw : 1,
        min : 0.25,
        max : 10,
        sensitivity : 0.005,
    },

    resetView: function(){
        this.scroll.x = 0;
        this.scroll.y = 0;
        this.zoom.level = 1;
        this.zoom.raw = 1;
    },

    url: null,
    bgUrl : null,
    bgAlpha : 55,
    showDirection : true,
    showDegreesOnEdit : true,
    showGrid : true,
    gridWeight : 1,

    normalMapMode : false, 
    neutralColor : 'TRANSPARENT',

    editorMode: 'LIGHT',
}

export const angleDisplay = {
    x: 0,
    y: 0,
    angle: 0,
    update: undefined,  // <AngleDisplay> component will assign a callback here for triggering its next re-render ; gets called from <Canvas> p5Container via pointer events
    visible: false,
}

export const display = {
    angle: 0,
    tooltip: 'tooltip',
    refresh: undefined,
}

export const keyScroll = {
  up : false,
  down : false,
  left : false,
  right : false,
  shift : false,
}

/**
 * construct an rgba color object from up to 4 numerical arguments.\
 * values are clipped to 0-255 range
 * 
 * 1 argument : rgb ; a = 255\
 * 2 argument : rgb, a\
 * 3 argument : r, g, b ; a = 255\
 * 4 argument : r, g, b, a
 * @param  {...number} args 
 * @returns rgba object
 */
export function rgba(...args){
    if(args.length > 4) throw new Error(`rgba(): too many arguments (${args.length})`)
    
    for(let i = 0; i < args.length; i++){
        if(typeof args[i] !== 'number') throw new Error(`rgba(): argument ${i} (${args[i]}) is not a number`)
        args[i] = Math.min(Math.max(0,Math.round(args[i])), 255)
    }

    return {
        r: args[0],
        g: args.length >= 3 ? args[1] : args[0],
        b: args.length >= 3 ? args[2] : args[0],
        a: {
          2: args[1], 
          4: args[3]
        }[args.length] ?? 255
      }
}

export function clip(val, min, max){
    return Math.min(max, Math.max(min, val));
}