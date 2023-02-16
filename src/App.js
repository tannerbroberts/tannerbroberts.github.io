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
import { getItem, deleteItem, updateItem } from './api/io'
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
	// For the schedule
	const [scale, setScale] = useLS('scale', 3_600_000)
	const [unit, setUnit] = useLS('unit', 'hr')
	// For TimeWindow + AddItem + selectedItemName interface
	const [timeWindowBaseItem, setTimeWindowBaseItem] = useLS('timeWindowBaseItem', { name: 'test', children: [] })
	// For the ViewItem (button) + selectedItemName + Popup interface
	const [popupTitle, setPopupTitle] = useState('')

	const openPopup = useCallback((child) => {
		setPopupOpen(true)
		setPopupChild(child)
	}, [])

	const closePopup = useCallback(() => {
		setPopupChild(null)
		setPopupOpen(false)
	}, [])

	const componentList = ['accounting', 'calendar', 'itemView']

	const pushFrame = (obj) => {
		if (obj && componentList.includes(obj.path) && obj.name) {
			setStack([...stack, obj])
			setSelectedItemName(null)
			if (obj.path === 'itemView') {
				setTimeWindowBaseItem(getItem(obj.name))
			}
		}
	}

	const popFrames = (popCount) => {
		if (stack.length > 1 && stack.length > popCount - 1 && popCount !== 0) {
			const newStack = stack.slice(0, popCount * -1)
			if (newStack[newStack.length - 1].path === 'itemView') {
				setTimeWindowBaseItem(getItem(newStack[newStack.length - 1].name))
			} else {
				// This is where I'll set the calendar and accountability views
				setTimeWindowBaseItem(undefined)
			}
			setStack(newStack)
		}
	}

	const deleteSelectedItemFromLibrary = () => {
		setStack(stack.filter((frame) => frame.name !== selectedItemName || frame.path !== 'itemView'))
		deleteItem(selectedItemName)
		setSelectedItemName(null)

		if (timeWindowBaseItem.name === selectedItemName) {
			setTimeWindowBaseItem(undefined)
		}
	}

	const pushItemViewFrame = () => {
		if (selectedItemName) {
			pushFrame({ path: 'itemView', name: selectedItemName })
			setTimeWindowBaseItem(getItem(selectedItemName))
			setSelectedItemName(null)
		}
	}

	const addSelectedItemToCurrentItemViewed = () => {
		if (selectedItemName) {
			// save the current state
			let newItemViewed
			if (timeWindowBaseItem?.children) {
				newItemViewed = {
					...timeWindowBaseItem,
					children: [
						...timeWindowBaseItem.children,
						{
							name: selectedItemName,
							position: 0,
						},
					],
				}
			} else {
				newItemViewed = {
					...timeWindowBaseItem,
					children: [
						{
							name: selectedItemName,
							position: 0,
						},
					],
				}
			}
			setTimeWindowBaseItem(newItemViewed)
			updateItem(newItemViewed)
			setSelectedItemName(null)
		}
	}

	const removeItemFromCurrentItemViewed = () => {
		// view needs update
		// currItemViewed LS needs update
	}

	const moveItemInCurrentItemViewed = () => {}

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
				deleteSelectedItemFromLibrary,
				pushItemViewFrame,
				addSelectedItemToCurrentItemViewed,
				removeItemFromCurrentItemViewed,
				moveItemInCurrentItemViewed,
				scale,
				setScale,
				unit,
				setUnit,
				timeWindowBaseItem,
				setTimeWindowBaseItem,
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
