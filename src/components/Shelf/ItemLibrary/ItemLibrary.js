import React from "react"
import { cssHelper } from "../../../api/cssHelper"
import { useItemLibraryStateContext } from "../../../providers/ItemLibraryContext"

const itemLibraryCSS = (openState) => {
	const obj = { ...cssHelper }
	if (openState) return obj

	return obj
}

export default function ItemLibrary() {
	const state = useItemLibraryStateContext()
	const { itemLibraryDrawerOpen } = state
	return (
		<div style={itemLibraryCSS(itemLibraryDrawerOpen)}>
			Item Library
		</div>
	)
}
