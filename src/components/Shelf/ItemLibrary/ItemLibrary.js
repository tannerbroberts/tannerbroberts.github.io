import React from "react"
import { cssHelper, STRUCTURE } from "../../../api/cssHelper"
import { useItemLibraryStateContext } from "../../../providers/ItemLibraryContext"
import ItemFilter from "./ItemFilter"
import ItemList from "./ItemList"
import ButtonBar from "./ButtonBar"

const itemLibraryCSS = (openState) => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
	}
	if (openState) return obj

	return obj
}

export default function ItemLibrary() {
	const state = useItemLibraryStateContext()
	const { itemLibraryDrawerOpen } = state
	return (
		<div style={itemLibraryCSS(itemLibraryDrawerOpen)}>
			<ButtonBar />
			<ItemFilter />
			<ItemList />
		</div>
	)
}
