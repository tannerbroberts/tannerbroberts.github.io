import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"
import { useATP_DispatchContext } from "../../../../../providers/ATP_Context"

const viewItemCSS = () => {
	const obj = cssHelper

	return obj
}

export default function ViewItem() {
	const dispatch = useATP_DispatchContext()
	return (
		<button
			style={viewItemCSS()}
			onClick={() =>
				dispatch({ type: "LOAD_FRAME", value: "ItemView" })
			}
		>
			View Item
		</button>
	)
}
