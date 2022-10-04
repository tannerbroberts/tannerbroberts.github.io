/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfCSS = {
	...cssHelper,
	width: "100%",
	gridTemplate: "1fr / minmax(0px, 4fr) 1fr",
}

export default function Shelf() {

	return (
		<div style={shelfCSS}>
			<div></div> {/** content area */}
			<ShelfToggle />
		</div>
	)
}
