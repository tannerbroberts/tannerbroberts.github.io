import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"
import { useGlobalContext } from "../../../../../GlobalContext"
import ItemCreationPopup from "../../../../Popup/ItemCreationPopup"

const newItemCSS = () => {
	const obj = { ...cssHelper, backgroundColor: "lightGreen" }

	return obj
}

export default function NewItem() {
	const { openPopup } = useGlobalContext()
	return (
		<button
			style={newItemCSS()}
			onClick={() => openPopup(<ItemCreationPopup />)}
		>
			Create New Item
		</button>
	)
}
