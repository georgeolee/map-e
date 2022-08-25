//App info to render inside of modal
export function Info(){

    const about = `This is a tool for creating quick and dirty vector maps from scratch. Download your map to use with a shader or some other program that reads data from textures.

    Each position in the grid has a unit vector attached to it. 
    
    Empty grid cells aren't rendered in the editor, but for encoding purposes are treated as the Z vector (0,0,1).
    
    All other grid cells represent unit vectors in the XY plane.
    
    `
    
    const encoding = `The RGB values for each pixel in the output file are computed from the XYZ components of the corresponding vector in the editor grid. 
    
    The alpha values depend on the editor mode:
    
    By default, empty pixels have a value of 0 (fully transparent) and all other pixels have a value of 255 (fully opaque).
    
    In normal map mode, alpha is always 255.
    
    `

    const controls = `Click and drag on the grid to add, rotate, and remove vectors

    Zoom: pinch | ctrl + wheel

    Pan: 2 finger drag | wheel | alt + drag

    Long press (mobile) or hover (desktop) to show tooltips
    
    v 0.1.2
    ©2022 george lee`


    return(
        <div id="info">
            <h2 style={{fontSize:'2rem', fontWeight:'normal'}}>About</h2>
            <div>{about}</div>

            <h2 style={{fontSize:'2rem', fontWeight:'normal'}}>Encoding</h2>
            <div>{encoding}</div>     
            
            <h2 style={{fontSize:'2rem', fontWeight:'normal'}}>Controls</h2>
            <div>{controls}</div>
        </div>
    );

}