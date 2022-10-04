import React from "react"
import { cssHelper } from "./api/cssHelper"
import Main from "./components/Main"
import Shelf from "./components/Shelf"
import ATP_ContextProvider from "./providers/ATP_Context"

function App() {
	const AppCSS = {
		...cssHelper,
		height: "95vh",
		width: "95vw",
		marginTop: "10px",
		gridTemplate: "1fr / 2fr minmax(0px, 1fr)",
	}

	return (
		<React.StrictMode>
			<ATP_ContextProvider>
				<div style={AppCSS}>
					<Main />
					<Shelf />
				</div>
			</ATP_ContextProvider>
		</React.StrictMode>
	)
}

export default App
