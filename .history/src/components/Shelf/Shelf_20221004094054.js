/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"

const shelfCSS = {
	...cssHelper,
	width: "100%",
	gridTemplate: "1fr / 4fr 1fr",
}

export default function Shelf() {

	return (
		<div style={shelfCSS}>
			<div></div> {/** content area */}
			<ShelfToggle />
		</div>
	)
}
