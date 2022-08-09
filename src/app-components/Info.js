//App info to render inside of modal
export function Info(){

    const about = `This is a tool for creating simple vector maps for use in shaders or other programs that decode data from textures.

    Each position in the grid has a unit vector associated with it. 
    
    Empty grid cells are not rendered in the editor, but for encoding purposes are treated as the positive Z vector (0,0,1).
    
    All other grid cells represent vectors in the XY plane.
    
    `
    
    const encoding = `Vector maps are encoded as 4 channel PNG textures. 
    
    The RGB values for each pixel in the output file are computed from the XYZ components of the corresponding vector in the editor grid. 
    
    The alpha values depend on the editor mode:
    
    By default, empty cells have a value of 0 (fully transparent) and all other cells have a value of 255 (fully opaque).
    
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
            {/* <div>{garbage}</div>    */}
            <h2 style={{fontSize:'2rem', fontWeight:'normal'}}>Controls</h2>
            <div>{controls}</div>
        </div>
    );

}