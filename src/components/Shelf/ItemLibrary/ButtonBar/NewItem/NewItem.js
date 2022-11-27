import React from "react";
import { cssHelper } from "../../../../../api/cssHelper";
import { useATP_DispatchContext } from '../../../../../providers/ATP_Context'

const newItemCSS = () => {
    const obj = { ...cssHelper, backgroundColor: "lightGreen" }

    return obj
}

export default function NewItem() {
    const dispatch = useATP_DispatchContext()
    return (
        <button style={newItemCSS()} onClick={() => dispatch({type: "TOGGLE_ITEM_CREATE_MENU"})}>Create New Item</button>
    )
}