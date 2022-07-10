import { useState } from "react";

import { Button } from "./Button";

export function Checkbox(props){

    const {
        id,
        func = b => console.log(`checkbox value: ${b}`),
        tooltip,
    } = props;

    const [isChecked, setChecked] = useState(props.checked)

    const buttonProps = {
        tooltip: tooltip,
        id: id,
        className: isChecked ? 'checkbox' : 'checkbox checked',
        onClick: () => {
            const newState = !isChecked;  
            func(newState);
            setChecked(newState);
        },
    }
    

    return<Button {...buttonProps}/>;
}