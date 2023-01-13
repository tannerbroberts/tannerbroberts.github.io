import React, { useCallback, useState } from "react"
import ScreenStack from "./components/ScreenStack"
import Shelf from "./components/Shelf"
import Popup from "./components/Popup"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import ShelfToggle from "./components/FloatingActionButtonWrapper/FloatingActionButtonWrapper"
import { GlobalContextProvider } from "./GlobalContext"

const appCSS = {
	display: "flex",
	flexFlow: "row",
	alignItems: "stretch",
	height: "98vh",
	width: "98vw",
}

function App() {
	// App context variables
	const [shelfOpen, setShelfOpen] = useState(true)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupChild, setPopupChild] = useState(() => {})

	const openPopup = (child) => {
		setPopupOpen(true)
		setPopupChild(child)
	}

	const closePopup = useCallback(() => {
		setPopupChild(() => {})
		setPopupOpen(false)
	})

	return (
		<GlobalContextProvider
			value={{
				shelfOpen,
				setShelfOpen,
				popupOpen,
				openPopup,
				closePopup,
			}}
		>
			<div style={appCSS}>
				<ScreenStack />
				<Shelf />
				<Popup title='Item Creation Menu'>{popupChild}</Popup>
				<ShelfToggle />
			</div>
		</GlobalContextProvider>
	)
}

export default App
