import React, {
	createContext,
	useCallback,
	useContext,
	useState,
} from "react"
import { useLS } from "./api/useLS"
import ScreenStack from "./components/ScreenStack"
import Shelf from "./components/Shelf"
import Popup from "./components/Popup"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import ShelfToggle from "./components/FloatingActionButtonWrapper/FloatingActionButtonWrapper"
// import { setls } from "./notes"
// setls()

const appCSS = {
	display: "flex",
	flexFlow: "row",
	alignItems: "stretch",
	height: "98vh",
	width: "98vw",
}

const GlobalContext = createContext()

function App() {
	// App context variables
	const [shelfOpen, setShelfOpen] = useLS("shelfOpen", true)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupChild, setPopupChild] = useState(null)
	// For the screen stack
	const [stack, setStack] = useLS("stack", [{ path: "calendar" }])
	// For the library list of items
	const [selectedItemName, setSelectedItemName] = useLS(
		"selectedItemName",
		null
	)
	const [scale, setScale] = useLS("scale", 3_600_000)
	const [unit, setUnit] = useLS("unit", "hr")

	const openPopup = (child) => {
		setPopupOpen(true)
		setPopupChild(child)
	}

	const closePopup = useCallback(() => {
		setPopupChild(null)
		setPopupOpen(false)
	})

	const componentList = ["accounting", "calendar", "itemView"]

	const pushFrame = (obj) => {
		if (obj && componentList.includes(obj.path) && obj.name) {
			setStack([...stack, obj])
			setSelectedItemName(null)
		}
	}

	const popFrames = (popCount) => {
		if (
			stack.length > 1 &&
			stack.length > popCount - 1 &&
			popCount !== 0
		) {
			setStack(stack.slice(0, popCount * -1))
		}
	}

	const openItemView = () => {
		if (selectedItemName) {
			pushFrame({ path: "itemView", name: selectedItemName })
			setSelectedItemName(null)
		}
	}

	const addItem = () => {
		// I need to add the selected item to the item being displayed on top of the stack. It'll also be nice to not have any items in the
		// library view that are smaller than the one on the top of the screenStack
		// This function doesn't do the actual adding, it just opens the popup that will have the submit button which adds it.
		// The popup is needed because there can be scheduling conflicts which need to be resolved before scheduling
		// It's also needed for the mere fact that the start time needs to be resolved as well.
	}

	return (
		<GlobalContext.Provider
			value={{
				shelfOpen,
				setShelfOpen,
				popupOpen,
				openPopup,
				closePopup,
				stack,
				setStack,
				popFrames,
				selectedItemName,
				setSelectedItemName,
				openItemView,
				addItem,
				scale,
				setScale,
				unit,
				setUnit,
			}}
		>
			<div style={appCSS}>
				<ScreenStack />
				<Shelf />
				<Popup title='Item Creation Menu'>{popupChild}</Popup>
				<ShelfToggle />
			</div>
		</GlobalContext.Provider>
	)
}

export default App

export const useGlobalContext = () => useContext(GlobalContext)
