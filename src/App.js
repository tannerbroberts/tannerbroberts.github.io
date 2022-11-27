import React from "react"
import { cssHelper, STRUCTURE } from "./api/cssHelper"
import Main from "./components/Main"
import Shelf from "./components/Shelf"
import ShelfToggle from "./components/ShelfToggle"
import ATP_ContextProvider from "./providers/ATP_Context"
import Popup from "./components/Popup/Popup"

function App() {
	const AppCSS = {
		...cssHelper,
		...STRUCTURE,
		height: "95vh",
		width: "95vw",
		marginTop: "10px",
		// If you change this from flex, update the main README
		display: "flex",
		position: "relative",
	}

	return (
		<ATP_ContextProvider>
			<div style={AppCSS}>
				<Main />
				<Shelf />
				<ShelfToggle />
				<Popup />
			</div>
		</ATP_ContextProvider>
	)
}

export default App
