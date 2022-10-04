/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfCSS = (openStatus) {
	const obj = {
		...cssHelper,
		width: "100%",
		gridTemplate: "1fr / minmax(0px, 4fr) 1fr",
	}
	openStatus ? delete obj.display : obj.display: 
}

export default function Shelf() {
	const { shelfOpen } = useATP_StateContext()

	return (
		<div style={shelfCSS(shelfOpen)}>
			<div></div> {/** content area */}
			<ShelfToggle />
		</div>
	)
}
