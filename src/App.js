import React, { createContext, useCallback, useContext, useState } from 'react'
import { useLS } from './api/useLS'
import ScreenStack from './components/ScreenStack'
import Shelf from './components/Shelf'
import Popup from './components/Popup'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import ShelfToggle from './components/FloatingActionButtonWrapper'
import { getItem } from './api/io'
import { cssHelper, STRUCTURE } from './api/cssHelper'
// import { setls } from "./notes"
// setls()

const appCSS = (shelfOpen) => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
		width: '100%',
		height: '100vh',
		overflowY: 'hidden',
		padding: 0,
		gap: 'none',
		border: 'none',
	}

	if (shelfOpen) obj.gridTemplateColumns = '1fr 1fr'
	else delete obj.gridTemplateColumns

	return obj
}

const GlobalContext = createContext()

function App() {
	// App context variables
	const [shelfOpen, setShelfOpen] = useLS('shelfOpen', true)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupChild, setPopupChild] = useState(null)
	// For the screen stack
	const [stack, setStack] = useLS('stack', [{ path: 'calendar' }])
	// For the library list of items
	const [selectedItemName, setSelectedItemName] = useLS('selectedItemName', null)
	// For the scheduler
	const [scale, setScale] = useLS('scale', 3_600_000)
	const [unit, setUnit] = useLS('unit', 'hr')
	// For the TimeWindow
	const [children, setChildren] = useState([])
	const [popupTitle, setPopupTitle] = useState('')

	const openPopup = (child) => {
		setPopupOpen(true)
		setPopupChild(child)
	}

	const closePopup = useCallback(() => {
		setPopupChild(null)
		setPopupOpen(false)
	})

	const componentList = ['accounting', 'calendar', 'itemView']

	const pushFrame = (obj) => {
		if (obj && componentList.includes(obj.path) && obj.name) {
			setStack([...stack, obj])
			setSelectedItemName(null)
		}
	}

	const popFrames = (popCount) => {
		if (stack.length > 1 && stack.length > popCount - 1 && popCount !== 0) {
			setStack(stack.slice(0, popCount * -1))
		}
	}

	const openItemView = () => {
		if (selectedItemName) {
			pushFrame({ path: 'itemView', name: selectedItemName })
			setChildren(getItem(selectedItemName)?.children ?? [])
			setSelectedItemName(null)
		}
	}

	const addItem = () => {
		if (selectedItemName) {
			setChildren([
				...children,
				{
					name: selectedItemName,
					position: 0,
				},
			])
			setSelectedItemName(null)
		}
	}

	return (
		<GlobalContext.Provider
			value={{
				shelfOpen,
				setShelfOpen,
				popupOpen,
				openPopup,
				closePopup,
				popupTitle,
				setPopupTitle,
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
				children,
				setChildren,
			}}
		>
			<div style={appCSS(shelfOpen)}>
				<ScreenStack />
				<Shelf />
				<Popup>{popupChild}</Popup>
				<ShelfToggle />
			</div>
		</GlobalContext.Provider>
	)
}

export default App

export const useGlobalContext = () => useContext(GlobalContext)
