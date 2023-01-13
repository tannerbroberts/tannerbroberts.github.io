import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"
import { useGlobalContext } from "../../../../../GlobalContext"

const viewItemCSS = () => {
	const obj = cssHelper

	return obj
}

export default function ViewItem() {
	const context = useGlobalContext()
	const { pushFrame } = context
	return (
		<button
			style={viewItemCSS()}
			onClick={() => {
				console.log("pushed a frame", context)
				pushFrame({ path: "itemView", name: "item" })
			}}
		>
			View Item
		</button>
	)
}
