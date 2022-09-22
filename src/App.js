import React from "react"
import Main from "./components/Main"
import Shelf from "./components/Shelf"

const AppCSS = {
	display: "flex",
	alignItems: "stretch",
	backgroundColor: "rgba(0, 100, 20, 0.2)",
	width: "100%",
	height: "95vh",
	scrollX: "none",
	scrollY: "none",
	border: "2px solid rgba(0, 100, 20, 0.5)",
	borderRadius: "10px",
}

function App() {
	return (
		<div style={AppCSS}>
			<Main />
			<Shelf />
		</div>
	)
}

export default App
