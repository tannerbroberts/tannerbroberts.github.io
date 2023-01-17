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
	// For the screen stack
	const [count, setCount] = useState(1)
	const [stack, setStack] = useState([{ path: "calendar" }])
	// For the library list of items
	const [selectedItemName, setSelectedItemName] = useState("")

	const openPopup = (child) => {
		setPopupOpen(true)
		setPopupChild(child)
	}

	const closePopup = useCallback(() => {
		setPopupChild(() => {})
		setPopupOpen(false)
	})

	const componentList = ["accounting", "calendar", "itemView"]

	const pushFrame = (obj) => {
		if (obj && componentList.includes(obj.path) && obj.name) {
			setStack(() => [...stack, obj])
			setCount(() => count + 1)
			setSelectedItemName("")
		}
	}

	const popFrames = (popCount) => {
		if (stack.length > 1 && stack.length > popCount - 1 && popCount !== 0) {
			setStack(() => stack.slice(0, popCount * -1))
			setCount(() => count - popCount)
		}
	}

	const openItemView = () => {
		if (selectedItemName) {
			pushFrame({ path: "itemView", name: selectedItemName })
			setSelectedItemName("")
		}
	}

	const addItem = () => {
		// I need to add the selected item to the stack. It'll also be nice to not have any items in the
		// library view that are smaller than the one on the top of the screenStack
	}

	return (
		<GlobalContextProvider
			value={{
				shelfOpen,
				setShelfOpen,
				popupOpen,
				openPopup,
				closePopup,
				stack,
				setStack,
				count,
				setCount,
				popFrames,
				selectedItemName,
				setSelectedItemName,
				openItemView,
				addItem,
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
