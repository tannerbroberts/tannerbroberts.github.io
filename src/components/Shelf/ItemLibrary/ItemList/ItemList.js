import React from "react"
import { cssHelper } from "../../../../api/cssHelper"
import ListItem from "./ListItem"
import { useATP_StateContext } from "../../../../providers/ATP_Context"

const itemListCSS = () => {
	const obj = { ...cssHelper }

	return obj
}

export default function ItemList() {
	const { library, focusedListItem } = useATP_StateContext()

	return (
		<div style={itemListCSS()}>
			{library.map((name) => {
				return (
					<ListItem
						key={name}
						itemName={name}
						focused={name === focusedListItem}
					/>
				)
			})}
		</div>
	)
}
