import {
	// getLibrary() gets called in ATP_Context.js
	saveLibrary,
	// getItem,
	saveItem,
	deleteItem,
	// getVariable,
	// saveVariable,
	// deleteVariable,
} from "../api/io"

export const initialState = {
	// It's a stack because we want to be able to nest frame layers in the app as the user navigates into deeper thoughts, and have a cohesive "go back" functionality
	// I want to stage changes and only make them permenant if the save button is pressed
	mainStack: [
		/* main frames 
			frameType: Accounting, ItemView, Calendar
		    value: for the name of the item being displayed */
		{ frameType: "Calendar", value: "", changeList: [] },
	],
	// This keeps track of weather or not the main shelf is open... That's it. Don't read anything into it
	shelfOpen: true,

	// This is the name of the item that should be rendered in the main screen.
	// Also the item that is highlighted in the library
	focusedListItem: undefined,

	library: [],

	// Item creation popup
	popupVisible: false,
}

// Put your reducer functions here
function loadFrame(state, action) {
	if (action?.value) {
		let frame
		if (action.value === "Calendar") {
			frame = { frameType: "Calendar", value: "", changeList: [] }
		} else if (action.value === "Accounting") {
			frame = { frameType: "Accounting", value: "", changeList: [] }
		} else {
			if (!state.focusedListItem) return state
			frame = {
				frameType: "ItemView",
				value: state?.focusedListItem,
				changeList: [],
			}
		}
		return {
			...state,
			mainStack: [...state.mainStack, frame],
			focusedListItem: "",
		}
	}
	return state
}
function closeFrame(state) {
	const stack = state.mainStack

	// Never let the Main-Calendar frame get popped
	if (stack.length > 1) stack.pop()
	return { ...state, mainStack: stack }
}
function toggleShelf(state) {
	return { ...state, shelfOpen: !state?.shelfOpen }
}
function setFocusedItem(state, action) {
	return { ...state, focusedListItem: action.value }
}
function toggleItemCreateMenu(state) {
	return { ...state, popupVisible: !state.popupVisible }
}
function createItem(state, action) {
	saveItem(action.value)
	saveLibrary([...state.library, action.value.name])
	return {
		...state,
		library: [...state.library, action.value.name],
		popupVisible: false,
	}
}
function removeItem(state, action) {
	if (action?.value) {
		deleteItem(action.value)
		const newLib = state.library.filter(
			(name) => name !== action.value
		)
		saveLibrary(newLib)
		return { ...state, library: newLib, focusedListItem: "" }
	}
	return state
}

const dispatchDictionary = {
	LOAD_FRAME: loadFrame,
	CLOSE_FRAME: closeFrame,
	TOGGLE_SHELF: toggleShelf,
	SET_FOCUSED_ITEM: setFocusedItem,
	TOGGLE_ITEM_CREATE_MENU: toggleItemCreateMenu,
	CREATE_ITEM: createItem,
	REMOVE_ITEM: removeItem,
}

export default function ATP_Reducer(state, action) {
	console.log("Calling App reducer with:", action)
	if (action?.type && dispatchDictionary[action?.type]) {
		console.log("Type is valid")
		return dispatchDictionary[action.type](state, action)
	}
	console.log("Something at the bottom of ATP_Reducer.js went wrong")
}
