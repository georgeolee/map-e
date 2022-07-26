//App info to render inside of modal
export function Info(){
    const tips = [
        'Click and drag to add/edit pixels.',
        'Click a pixel without dragging to delete it.',
        'Zoom: pinch | ctrl + wheel',
        'Pan: 2 finger drag | wheel | alt + drag',
        'Tooltips: long press (mobile) or hover (desktop) to show tooltips',
        'Normal Map Mode - Y axis is reversed and empty pixels are set to RGB(128,128,255)',
    ]

    const items = tips.map((str, i) => <li key={`info-${i}`}>{str}</li>);

    return(
        <ul id='info'>
            {items}
        </ul>
    );

}