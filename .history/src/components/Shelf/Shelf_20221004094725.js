/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfCSS = (openStatus) => {
	const obj = {...cssHelper}
	openStatus ? delete obj.display : (obj.display = "none")

	return obj
}

export default function Shelf() {
	const { shelfOpen } = useATP_StateContext()

	return (
		<div>
			<div style={shelfCSS(shelfOpen)}></div> {/** content area */}
			<ShelfToggle />
		</div>
	)
}
