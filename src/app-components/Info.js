//App info to render inside of modal
export function Info(){

    const about = `This is a tool for creating vector maps!
    Each cell in the grid represents 2 pieces of information: a 2D position, and a 2D (ish) direction at that position. 
    "Empty" cells are not rendered, but for encoding purposes are treated as unit Z vectors.
    All other directions are considered unit XY vectors.`
    
    const encoding = `Vector maps are encoded as PNG files. 
    Cell position corresponds one-to-one with pixel position in the output texture, while cell directions have their XYZ components remapped to RGB pixel color.
    In normal map mode, Y axis is reversed and empty cells are encoded with an opaque alpha channel.`

    const tips = [
        'Click and drag on the grid to add, rotate, and remove vectors',
        'Zoom: pinch | ctrl + wheel',
        'Pan: 2 finger drag | wheel | alt + drag',
        'Long press (mobile) or hover (desktop) to show tooltips',        
        'v 0.1.2',
        '©2022 george lee'
    ]

    const garbage = `Soy sauce salt miso butter roasted pork slices flavoured oil yuzu seasoned egg chopped onions soy milk chilli Hakata, scallions leek fish broth corn spinach lard toasted sesame seeds Kumamoto Nagoya Tokyo, spicy bean paste curry mustard greens vinegar Kagoshima tsukemen chicken stock abura soba Hakodate pork cubes. Ground black pepper pork bones mustard greens Kagoshima Wakayama butter Nagoya vinegar chicken stock leek yuzu spicy bean paste Yokohama scallions, miso kamaboko curry salt lard abura soba bean sprouts flavoured oil Asahikawa corn roasted pork slices. Leek roasted pork slices spicy bean paste soy sauce tsukemen ginger chicken stock, scallions toasted sesame seeds Hakata Hakodate seasoned egg.
    Soy sauce salt miso butter roasted pork slices flavoured oil yuzu seasoned egg chopped onions soy milk chilli Hakata, scallions leek fish broth corn spinach lard toasted sesame seeds Kumamoto Nagoya Tokyo, spicy bean paste curry mustard greens vinegar Kagoshima tsukemen chicken stock abura soba Hakodate pork cubes. Ground black pepper pork bones mustard greens Kagoshima Wakayama butter Nagoya vinegar chicken stock leek yuzu spicy bean paste Yokohama scallions, miso kamaboko curry salt lard abura soba bean sprouts flavoured oil Asahikawa corn roasted pork slices. Leek roasted pork slices spicy bean paste soy sauce tsukemen ginger chicken stock, scallions toasted sesame seeds Hakata Hakodate seasoned egg.

    Spinach sesame oil lard ginger Hakata spicy bean paste  flavoured oil, yuzu Kumamoto scallions vinegar kamaboko pork cubes Kagoshima roasted pork slices, soy sauce ground black pepper corn Yokohama Nagoya curry. Fish broth miso Kagoshima tsukemen Hakata mustard greens, corn Tokyo  Nagoya chopped onions, bean sprouts scallions Wakayama soy sauce. Kumamoto corn mustard greens soy milk yuzu pork cubes ground black pepper Tokyo leek roasted pork slices spicy bean paste Hakodate fish broth, ginger Hakata chicken stock Nagoya spinach scallions vinegar Kagoshima toasted sesame seeds miso pork bones. Tsukemen curry soy milk Hakodate Hakata abura soba Asahikawa leek fish broth chicken stock flavoured oil, vinegar salt lard scallions roasted pork slices Kagoshima pork cubes chopped onions kamaboko soy sauce, Tokyo miso Nagoya Kumamoto bean sprouts yuzu pork bones spicy bean paste Yokohama. Yuzu kamaboko pork bones flavoured oil miso pork cubes scallions soy sauce, chopped onions Asahikawa salt ground black pepper spicy bean paste , sesame oil Hakodate toasted sesame seeds corn roasted pork slices fish broth.
    
    Spinach sesame oil lard ginger Hakata spicy bean paste  flavoured oil, yuzu Kumamoto scallions vinegar kamaboko pork cubes Kagoshima roasted pork slices, soy sauce ground black pepper corn Yokohama Nagoya curry. Fish broth miso Kagoshima tsukemen Hakata mustard greens, corn Tokyo  Nagoya chopped onions, bean sprouts scallions Wakayama soy sauce. Kumamoto corn mustard greens soy milk yuzu pork cubes ground black pepper Tokyo leek roasted pork slices spicy bean paste Hakodate fish broth, ginger Hakata chicken stock Nagoya spinach scallions vinegar Kagoshima toasted sesame seeds miso pork bones. Tsukemen curry soy milk Hakodate Hakata abura soba Asahikawa leek fish broth chicken stock flavoured oil, vinegar salt lard scallions roasted pork slices Kagoshima pork cubes chopped onions kamaboko soy sauce, Tokyo miso Nagoya Kumamoto bean sprouts yuzu pork bones spicy bean paste Yokohama. Yuzu kamaboko pork bones flavoured oil miso pork cubes scallions soy sauce, chopped onions Asahikawa salt ground black pepper spicy bean paste , sesame oil Hakodate toasted sesame seeds corn roasted pork slices fish broth.
    `

    const items = tips.map((str, i) => <li key={`info-${i}`}>{str}</li>);

    return(
        <div id="info">
            <h2 style={{fontSize:'2rem', fontWeight:'normal'}}>About</h2>
            <div>{about}</div>
            <div>{encoding}</div>     
            <div>{garbage}</div>   
            <h2 style={{fontSize:'2rem', fontWeight:'normal'}}>Controls</h2>
            <ul id='info'>
                {items}
            </ul>
        </div>
    );

}