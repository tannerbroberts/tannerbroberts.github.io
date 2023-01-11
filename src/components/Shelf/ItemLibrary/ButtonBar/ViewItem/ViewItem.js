import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"

const viewItemCSS = () => {
	const obj = cssHelper

	return obj
}

export default function ViewItem() {
	return (
		<button
			style={viewItemCSS()}
			onClick={() => console.log("viewItem not hooked up")}
		>
			View Item
		</button>
	)
}
