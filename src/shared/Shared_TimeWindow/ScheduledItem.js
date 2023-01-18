import React from "react"
import { cssHelper } from "../../api/cssHelper"

const scheduledItemCSS = (position, length, scale) => {
	const obj = {
		...cssHelper,
		position: "absolute",
		top: `${Math.floor(position / scale)}px`,
		height: `${Math.floor(length / scale)}px`,
		textAlign: "center",
		lineHeight: "100%",
	}

	return obj
}

export default function ScheduledItem({ name, position, length, scale }) {
	return <div style={scheduledItemCSS(position, length, scale)}>{name}</div>
}
