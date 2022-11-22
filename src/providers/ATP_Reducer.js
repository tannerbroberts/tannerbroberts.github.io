import {
	// getLibrary() gets called in ATP_Context.js
	saveLibrary,
	// getItem,
	// saveItem,
	// deleteItem,
	// getVariable,
	// saveVariable,
	// deleteVariable,
} from "../api/io"

export const initialState = {
	// It's a stack because we want to be able to nest frame layers in the app as the user navigates into deeper thoughts, and have a cohesive "go back" functionality
	// I want to stage changes and only make them permenant if the save button is pressed
	mainStack: [
		/* main frames 
			frameType: accounting, itemView, Calendar
		    value: for the name of the item being displayed */
		{ frameType: "Calendar", value: "", changeList: [] },
	],
	// This keeps track of weather or not the main shelf is open... That's it. Don't read anything into it
	shelfOpen: true,

	// This is the item that should be rendered in the main screen.
	focusedItem: undefined,

	library: [],
}

// Put your reducer functions here

function loadFrame(state, action) {
	const stack = state.mainFrame
	stack.push(action.value)
	return { ...state, mainFrame: stack }
}
function closeFrame(state) {
	const stack = state.mainFrame

	// Never let the Main-Calendar frame get popped
	if (stack.length > 1) stack.pop()
	return { ...state, mainFrame: stack }
}
function toggleShelf(state) {
	return { ...state, shelfOpen: !state?.shelfOpen }
}
function setFocusedItem() {
	console.log(
		"called setFocusedItem in reducer, but its not setup yet"
	)
}

const dispatchDictionary = {
	LOAD_FRAME: loadFrame,
	CLOSE_FRAME: closeFrame,
	TOGGLE_SHELF: toggleShelf,
	SET_FOCUSED_ITEM: setFocusedItem,
}

export default function ATP_Reducer(state, action) {
	console.log("calling a App reducer function now")
	if (action.type && dispatchDictionary[action.type]) {
		saveLibrary(state.library)
		return dispatchDictionary[action.type](state, action)
	}
}
