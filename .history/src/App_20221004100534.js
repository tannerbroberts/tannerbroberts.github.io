import React from "react"
import { cssHelper } from "./api/cssHelper"
import Main from "./components/Main"
import Shelf from "./components/Shelf"

function App() {
	const AppCSS = {
		...cssHelper,
		height: "95vh",
		width: "95vw",
		marginTop: "10px",
		display: "flex",
	}

	return (
		<div style={AppCSS}>
			<Main />
			<Shelf />
		</div>
	)
}

export default App
