import React from "react"
import { cssHelper, STRUCTURE } from "../../api/cssHelper"
import ItemLibrary from "./ItemLibrary"
import Shared_Drawer from "../../shared/Shared_Drawer"
import { useGlobalContext } from "../../App"

const shelfCSS = (openStatus) => {
	const obj = {
		...cssHelper,
		STRUCTURE,
		gridTemplateRows: "min-content",
		overflowY: "scroll",
		// Just to make sure it fits the whole screen
		overflowX: "hidden",
	}
	openStatus ? null : (obj.display = "none")

	if (screen.width < "400px") {
		obj.position = "absolute"
		obj.top = 0
		obj.bottom = 0
		obj.left = 0
		obj.right = 0
		obj.zIndex = 1
	} 
	return obj
}

export default function Shelf() {
	const { shelfOpen } = useGlobalContext()
	return (
		<div style={shelfCSS(shelfOpen)}>
			<Shared_Drawer title='Item Library'>
				<ItemLibrary />
			</Shared_Drawer>
		</div>
	)
}
