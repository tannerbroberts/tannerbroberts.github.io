import React from "react"
import { cssHelper, STRUCTURE } from "./api/cssHelper"
import ScreenStack from "./components/ScreenStack"

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
		<ScreenStack style={AppCSS} />
	)
}

export default App
