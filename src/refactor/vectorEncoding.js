//functions for color to vector operations and vice-versa

import { BLUE_NORMALIZED_MAX, ALPHA_NORMALIZED_MIN } from "./constants";

import { N_BLUE, N_TRANSPARENT } from "./colors";

import { settings } from "./globals";

//radians
/**
 * 
 * 
 * @param {number} angle - in radians
 * @returns an object representing rgba color. b is always 128 and a is always 255
 */
export function colorFromAngle(angle){
    //vector components
    const x = Math.cos(angle);
    const y = Math.sin(angle);

    const r = Math.min(128 + Math.round(128*x), 255);
    const g = Math.min(128 + Math.round(128*y), 255);

    return {
        r: r,
        g: g,
        b: 128, //z component is 0
        a: 255, 
    }
}

/**
 * 
 * @param {number} r - red channel value from 0-255
 * @param {number} g - green channel value from 0-255
 * @returns angle in radians
 */

export function angleFromColorRG(r, g){
    const y = g - 128;
    const x = r - 128;
    return Math.atan2(y, x);
}

/**
 * decodes and then re-encodes vector information from image colors, which results in a more uniform appearance
 * 
 * @param {p5Image} pimg p5 image to recolor
 */
export function recolor(pimg){
    pimg.loadPixels();

    const neutralColor = settings.normalMapMode ? N_BLUE : N_TRANSPARENT;

    for(let i = 0; i < pimg.pixels.length; i+= 4){

      //is it a neutral pixel?
      const isNeutralPixel = isNeutralColor(pimg.pixels[i+2], pimg.pixels[i+3]);

      //color by angle, or make transparent / blue if neutral
      const c = isNeutralPixel ? neutralColor : colorFromAngle(angleFromColorRG(pimg.pixels[i], pimg.pixels[i+1]));

      pimg.pixels[i] = c.r;
      pimg.pixels[i+1] = c.g;
      pimg.pixels[i+2] = c.b;
      pimg.pixels[i+3] = c.a;
    }
    pimg.updatePixels();
  }


/**
 * 
 * @param  {number|object} args 2 numbers (blue, alpha) or an rgba object
 */
export function isNeutralColor(...args){
    const [blue, alpha] = {
        1: [args.b, args.a],
        2: [args[0], args[1]]
    }[args.length];

    if(typeof blue !== 'number' || typeof alpha !== 'number') throw new Error('isNeutral(): blue or alpha not a number');

    return Math.abs(blue - 128) / 128 > BLUE_NORMALIZED_MAX || alpha / 255 < ALPHA_NORMALIZED_MIN;
}