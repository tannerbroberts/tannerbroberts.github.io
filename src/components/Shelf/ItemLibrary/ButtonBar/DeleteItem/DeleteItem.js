import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"
import {
	useATP_DispatchContext,
	useATP_StateContext,
} from "../../../../../providers/ATP_Context"

const deleteItemCSS = () => {
	const obj = { ...cssHelper, backgroundColor: "rgb(255, 70, 70)" }

	return obj
}

export default function DeleteItem() {
	const dispatch = useATP_DispatchContext()
	const { focusedListItem } = useATP_StateContext()
	return (
		<button
			style={deleteItemCSS()}
			onClick={() =>
				dispatch({
					type: "REMOVE_ITEM",
					value: focusedListItem ?? "",
				})
			}
		>
			Delete Item
		</button>
	)
}
