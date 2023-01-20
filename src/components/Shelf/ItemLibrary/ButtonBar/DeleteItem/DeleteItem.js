import React from "react"
import { Button } from "@mui/material"
import { cssHelper } from "../../../../../api/cssHelper"
import { deleteItem } from "../../../../../api/io"
import { useGlobalContext } from "../../../../../App"

const deleteItemCSS = () => {
	const obj = {
		...cssHelper,
		backgroundColor: "rgb(255, 70, 70)",
		color: "black",
	}

	return obj
}

export default function DeleteItem() {
	const { stack, setStack, selectedItemName, setSelectedItemName } =
		useGlobalContext()

	const deleteListener = () => {
		setStack(
			stack.filter(
				(frame) =>
					frame.name !== selectedItemName || frame.path !== "itemView"
			)
		)
		deleteItem(selectedItemName)
		setSelectedItemName(null)
	}

	return (
		<Button style={deleteItemCSS()} onClick={deleteListener}>
			Delete Item
		</Button>
	)
}
