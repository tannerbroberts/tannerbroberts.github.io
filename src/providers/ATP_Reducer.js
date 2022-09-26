export const initialState = {
	mainStack: [
		/* main frames */
		{ frameType: "", value: "" },
	],
	shelf: {
		/* directly corresponds to the main frame */
	},
	shelfOpen: true,
	library: [
		/* All items live here. Eventually, they're going to be returned from the server */
	],
	filters: [
		/* object list of matchers 
		{complexVariableMatcher: criteria list}
		{nameContains: STRING},
		{containsVariable: VARIABLE_ID},
		{color: COLOR},
		{pattern: PATTERN},
		{owner: USER_ID},
		{createdBy: DATE},
		{length: TIME_LENGTH},
		{pattern: PATTERN},
		*/
	],
}

function loadFrame(state, action) {
	const stack = state.mainFrame
	stack.push(action.value)
	return { ...state, mainFrame: stack }
}

function closeFrame(state) {
	const stack = state.mainFrame
	stack.pop()
	return { ...state, mainFrame: stack }
}

function toggleShelf(state) {
	return { ...state, shelfOpen: !state?.shelfOpen }
}

const dispatchDictionary = {
	LOAD_FRAME: loadFrame,
	CLOSE_FRAME: closeFrame,
	TOGGLE_SHELF: toggleShelf,
}

export default function ATP_Reducer(state, action) {
	console.log('calling a reducer function now')
	if (action.type && dispatchDictionary[action.type])
		return dispatchDictionary[action.type](state, action)
}
