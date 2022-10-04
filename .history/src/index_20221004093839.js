import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import ATP_ContextProvider from "./providers/ATP_Context"


const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
	<React.StrictMode>
		<ATP_ContextProvider>
			<React.StrictMode>
				<App />
			</React.StrictMode>
		</ATP_ContextProvider>
	</React.StrictMode>
)
