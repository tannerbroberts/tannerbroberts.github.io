import React from "react"
import { color4, cssHelper } from "../../../../api/cssHelper"
import ListItem from "./ListItem"

const itemListCSS = () => {
	const obj = { ...cssHelper, ...color4 }

	return obj
}

export default function ItemList() {
	const items = [
		{ name: "tanner" },
		{ name: "first" },
		{ name: "second" },
		{ name: "third" },
		{ name: "fourth" },
		{ name: "fifth" },
		{ name: "sixth" },
		{ name: "seventh" },
		{ name: "eighth" },
		{ name: "nineth" },
		{ name: "tenth" },
		{ name: "eleventh" },
		{ name: "twelveth" },
	]
	return <div style={itemListCSS()}>{items.map((item) => {
        return <ListItem key={item} item={item} />
    })}</div>
}
