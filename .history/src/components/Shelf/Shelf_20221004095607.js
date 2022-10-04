/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfContentCSS = (openStatus) => {
	const obj = { ...cssHelper,
	openStatus ? delete obj.display : (obj.display = "none")
	return obj
}

const shelfCSS = {
	...cssHelper,
	gridTemplate: "1fr / 4fr 20px",
}

export default function Shelf() {
	const { shelfOpen } = useATP_StateContext()

	return (
		<div style={shelfCSS}>
			<div style={shelfContentCSS(shelfOpen)}></div>{" "}
			{/** content area */}
			<ShelfToggle />
		</div>
	)
}
