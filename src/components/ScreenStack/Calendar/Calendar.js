import React from "react"
import { cssHelper } from "../../../api/cssHelper"
import { useScreenStackContext } from "../ScreenStackContext"

export default function Calendar() {
	const { pushFrame } = useScreenStackContext()
	return (
		<h1 style={cssHelper}>
			Calendar
			<button onClick={() => pushFrame({ path: "itemView" })}>Item</button>
		</h1>
	)
}
