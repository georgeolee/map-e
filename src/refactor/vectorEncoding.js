//functions for color to vector operations and vice-versa

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