import React from "react"
import { color5, cssHelper } from "./api/cssHelper"
import Main from "./components/Main"
import Shelf from "./components/Shelf"
import ShelfToggle from "./components/ShelfToggle"

function App() {
	const AppCSS = {
		...cssHelper,
		...color5,
		height: "95vh",
		width: "95vw",
		marginTop: "10px",
		display: "flex",
		position: "relative",
	}

	return (
		<div style={AppCSS}>
			<Main />
			<Shelf />
			<ShelfToggle />
		</div>
	)
}

export default App
