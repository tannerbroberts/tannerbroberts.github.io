import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"

const newItemCSS = () => {
	const obj = { ...cssHelper, backgroundColor: "lightGreen" }

	return obj
}

export default function NewItem() {
	return (
		<button
			style={newItemCSS()}
			onClick={console.log(" newItem not hooked up yet")}
		>
			Create New Item
		</button>
	)
}
