import React from "react"
import { cssHelper, STRUCTURE } from "../../api/cssHelper"
import ItemLibrary from "./ItemLibrary"
import Shared_Drawer from "../../shared/Shared_Drawer"

const shelfCSS = (openStatus) => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
		width: "40%",
		overflowY: "scroll",
	}
	openStatus ? "" : (obj.display = "none")

	return obj
}

export default function Shelf() {
	return (
		<div style={shelfCSS(true)}>
			<Shared_Drawer title='Item Library'>
				<ItemLibrary />
			</Shared_Drawer>
		</div>
	)
}
