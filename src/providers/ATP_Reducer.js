export const initialState = {
	mainStack: [
		/* main frames 
			frameType: accounting, itemView, Calendar
		    value: for the name of the item being displayed */
		{ frameType: "Calendar", value: "" },
	],
	shelfOpen: true,
	focusedItem: undefined,
}

// Put your reducer functions here
function loadFrame(state, action) {
	const stack = state.mainFrame
	stack.push(action.value)
	return { ...state, mainFrame: stack }
}
function closeFrame(state) {
	const stack = state.mainFrame

	// Never let the main calendar frame get popped
	if(stack.length > 1) stack.pop()
	return { ...state, mainFrame: stack }
}
function toggleShelf(state) {
	return { ...state, shelfOpen: !state?.shelfOpen }
}
function setFocusedItem() {
	console.log("called setFocusedItem in reducer, but its not setup yet")
}

const dispatchDictionary = {
	LOAD_FRAME: loadFrame,
	CLOSE_FRAME: closeFrame,
	TOGGLE_SHELF: toggleShelf,
	SET_FOCUSED_ITEM: setFocusedItem,
}

export default function ATP_Reducer(state, action) {
	console.log("calling a App reducer function now")
	if (action.type && dispatchDictionary[action.type])
		return dispatchDictionary[action.type](state, action)
}
