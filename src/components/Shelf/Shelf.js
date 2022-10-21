/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import { useATP_StateContext } from "../../providers/ATP_Context"
import ItemLibraryContextProvider from "../../providers/ItemLibraryContext"
import ItemLibrary from "./ItemLibrary"

const shelfCSS = (openStatus) => {
	const obj = { ...cssHelper, width: "40%" }
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
		<div style={shelfCSS(shelfOpen)}>
			<ItemLibraryContextProvider>
				<ItemLibrary />
			</ItemLibraryContextProvider>
			<CurrentShelfAddons state={state} />
		</div>
	)
}
