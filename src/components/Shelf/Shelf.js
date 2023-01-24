import React from "react"
import {
	cssHelper,
	STRUCTURE,
} from "../../api/cssHelper"
import ItemLibrary from "./ItemLibrary"
import Shared_Drawer from "../../shared/Shared_Drawer"
import { useGlobalContext } from "../../App"

const shelfCSS = (openStatus) => {
	const obj = {
		...cssHelper,
		STRUCTURE,
		gridTemplateRows: "min-content",
		overflowY: "scroll",
	}
	openStatus ? null : (obj.display = "none")
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
