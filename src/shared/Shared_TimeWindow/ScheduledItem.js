import React from "react"
import { cssHelper } from "../../api/cssHelper"
import { getItem } from "../../api/io"
import { useGlobalContext } from "../../GlobalContext"
import useLongPress from "../../api/useLongPress"

const scheduledItemCSS = (position, length) => {
	const { scale } = useGlobalContext()
	const obj = {
		...cssHelper,
		position: "absolute",
		top: `${(position / scale) * 100}px`,
		left: "100px",
		width: "calc(100% - 101px)",
		height: `${(length / scale) * 100}px`,
		textAlign: "center",
		padding: "10px",
		backgroundColor: "rgba(155, 255, 155, 1)",
		borderRadius: "10px",
	}

	return obj
}

const onLongPress = () => {
	console.log("pressed long")
}

export default function ScheduledItem({ name, position }) {
	const longPressProps = useLongPress(onLongPress)
	const { length } = getItem(name)
	return (
		<div
			{...longPressProps}
			style={scheduledItemCSS(position, length)}
		>
			{name}
		</div>
	)
}
