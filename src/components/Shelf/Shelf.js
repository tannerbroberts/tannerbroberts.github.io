import React from "react"
import { cssHelper, STRUCTURE } from "../../api/cssHelper"
import { useATP_StateContext } from "../../providers/ATP_Context"
import ItemLibraryContextProvider from "../../providers/ItemLibraryContext"
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

const CurrentShelfAddons = ({ state }) => {
	// add more shelves here if the frame warrents it
	if (state) return <h1>addons</h1>
}

export default function Shelf() {
	const state = useATP_StateContext()
	const { shelfOpen } = state

	return (
		<ItemLibraryContextProvider>
			<div style={shelfCSS(shelfOpen)}>
			<Shared_Drawer title='Item Library'>
					<ItemLibrary />
				</Shared_Drawer>
				<Shared_Drawer title='Item Library'>
					<ItemLibrary />
				</Shared_Drawer>
				<Shared_Drawer title='Item Library'>
					<ItemLibrary />
				</Shared_Drawer>
				<Shared_Drawer title='Item Library'>
					<ItemLibrary />
				</Shared_Drawer>
				<Shared_Drawer title='Item Library'>
					<ItemLibrary />
				</Shared_Drawer>
				<CurrentShelfAddons state={state} />
			</div>
		</ItemLibraryContextProvider>
	)
}
