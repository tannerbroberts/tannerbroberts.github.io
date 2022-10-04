/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfCSS = (openStatus) => {


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
