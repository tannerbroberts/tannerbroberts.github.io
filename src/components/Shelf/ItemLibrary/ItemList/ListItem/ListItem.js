import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"
import { useATP_DispatchContext } from "../../../../../providers/ATP_Context"

const listItemCSS = (focused) => {
	const obj = { ...cssHelper }
	if (focused) {
		obj.border = "2px solid black"
	}

	return obj
}

export default function ListItem({ itemName, focused = false }) {
	const dispatch = useATP_DispatchContext()
	return (
		<div
			style={listItemCSS(focused)}
			onClick={() =>
				dispatch({ type: "SET_FOCUSED_ITEM", value: itemName })
			}
		>
			{itemName}
		</div>
	)
}
