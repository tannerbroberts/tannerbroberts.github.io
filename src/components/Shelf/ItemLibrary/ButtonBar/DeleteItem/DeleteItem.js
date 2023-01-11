import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"

const deleteItemCSS = () => {
	const obj = { ...cssHelper, backgroundColor: "rgb(255, 70, 70)" }

	return obj
}

export default function DeleteItem() {
	return (
		<button
			style={deleteItemCSS()}
			onClick={() => console.log("delete not hooked up yet")}
		>
			Delete Item
		</button>
	)
}
