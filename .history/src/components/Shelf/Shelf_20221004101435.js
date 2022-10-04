/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfContentCSS = (openStatus) => {
	const obj = { ...cssHelper }
	openStatus ? '' : (obj.display = "none")

	return obj
}

const shelfCSS = (openStatus) => {
	const obj = { ...cssHelper, position: "absolute", width: "50%" }
	openStatus ? obj.left = "10px" : (obj.left = "-100px")

	return obj
}

export default function Shelf() {
	const { shelfOpen } = useATP_StateContext()

	return (
		<div style={shelfCSS(shelfOpen)}>
			<div style={shelfContentCSS(shelfOpen)}></div> {/** content area */}
			<ShelfToggle />
		</div>
	)
}
