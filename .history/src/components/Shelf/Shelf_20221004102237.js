/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import { useATP_StateContext } from "../../providers/ATP_Context"

const shelfCSS = (openStatus) => {
	const obj = { ...cssHelper, width: "50%" }
	openStatus ? obj.right = "10px" : (obj.right = "-100px")

	return obj
}

export default function Shelf() {
	const { shelfOpen } = useATP_StateContext()

	return (
		<div style={shelfCSS(shelfOpen)}>
			<div style={shelfContentCSS(shelfOpen)}></div> {/** content area */}
		</div>
	)
}
