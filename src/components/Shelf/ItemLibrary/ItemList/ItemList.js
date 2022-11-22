import React from "react"
import { color4, cssHelper } from "../../../../api/cssHelper"
import ListItem from "./ListItem"
import { useATP_StateContext } from "../../../../providers/ATP_Context"

const itemListCSS = () => {
	const obj = { ...cssHelper, ...color4 }

	return obj
}

export default function ItemList() {
	const { library } = useATP_StateContext()
	console.log("lib", library);
	
	return <div style={itemListCSS()}>{library.map((item) => {
        return <ListItem key={item} item={item} />
    })}</div>
}
