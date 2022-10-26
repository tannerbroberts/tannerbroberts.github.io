import React from "react";
import { color4, cssHelper } from "../../../../api/cssHelper";

const itemFilterCSS = () => {
    const obj = { ...cssHelper, ...color4 }

    return obj
}

export default function ItemFilter() {
    return (
        <div style={itemFilterCSS()}>Item Filter placeholder</div>
    )
}