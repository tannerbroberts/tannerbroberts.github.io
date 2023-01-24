import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

document.getElementsByTagName("body")[0].style.width = "95%"
document.getElementsByTagName("body")[0].style.margin = "auto"
document.getElementsByTagName("body")[0].style.backgroundColor =
	"blue"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
