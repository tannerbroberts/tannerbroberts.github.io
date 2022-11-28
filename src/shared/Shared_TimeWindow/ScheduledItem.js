import React from "react"
import { cssHelper } from "../../api/cssHelper"

const scheduledItemCSS = (position, length) => {
	const obj = {
		...cssHelper,
		position: "relative",
		top: `${position}px`,
		height: `${length}px`,
		textAlign: "center",
		lineHeight: "100%",
	}

	return obj
}

export default function ScheduledItem({ name, position, length }) {
	return <div style={scheduledItemCSS(position, length)}>{name}</div>
}
