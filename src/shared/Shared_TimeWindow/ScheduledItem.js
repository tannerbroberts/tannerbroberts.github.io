import React from "react"
import { cssHelper } from "../../api/cssHelper"
import { getItem } from "../../api/io"
import { useGlobalContext } from "../../GlobalContext"

const scheduledItemCSS = (position, length) => {
	const { scale } = useGlobalContext()
	const obj = {
		...cssHelper,
		position: "absolute",
		top: `${(position / scale) * 100}px`,
		left: "100px",
		width: "300px",
		height: `${(length / scale) * 100}px`,
		textAlign: "center",
		padding: "10px",
		backgroundColor: "rgba(155, 255, 155, 1)",
		borderRadius: "10px",
	}

	return obj
}

export default function ScheduledItem({ name, position }) {
	const itemData = getItem(name)
	return (
		<div style={scheduledItemCSS(position, itemData.length)}>
			{name}
		</div>
	)
}
