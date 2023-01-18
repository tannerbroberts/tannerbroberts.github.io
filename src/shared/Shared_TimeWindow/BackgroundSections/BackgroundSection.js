import React from "react"
import { cssHelper } from "../../../api/cssHelper"

const backgroundSectionCSS = (position) => {
	const obj = {
		...cssHelper,
		position: "absolute",
		top: `${position * 100}px`,
		height: "100px",
		border: "1px solid black",
		backgroundColor: "whitesmoke",
	}

	return obj
}

export default function BackgroundSection({
	position,
	length,
	scale,
}) {
	return <div style={backgroundSectionCSS(position, length, scale)} />
}
