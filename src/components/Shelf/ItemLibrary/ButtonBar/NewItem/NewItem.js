import React from "react";
import { cssHelper } from "../../../../../api/cssHelper";

const newItemCSS = () => {
    const obj = { ...cssHelper, backgroundColor: "lightGreen" }

    return obj
}

export default function NewItem() {
    return (
        <div style={newItemCSS()} onClick={() => console.log("Clicked new Item")}>Create New Item</div>
    )
}