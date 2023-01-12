import React from "react"
import { cssHelper, MOBILE_BREAKPOINT, STRUCTURE } from "../../api/cssHelper"
import ItemLibrary from "./ItemLibrary"
import Shared_Drawer from "../../shared/Shared_Drawer"
import { useGlobalContext } from "../../GlobalContext"

const shelfCSS = (openStatus) => {
	const obj = {
		...cssHelper,
		STRUCTURE,
		gridTemplateRows: "min-content",
		width: "150%",
		overflowY: "scroll",
	}
	openStatus ? null : (obj.display = "none")
	if(window.innerWidth < MOBILE_BREAKPOINT) {
		obj.position = "absolute"
		obj.width="95vw"
		obj.height="95vh"
		obj.left=0

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
