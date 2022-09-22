export const initialState = {
	mainStack: [
		/* main frames */
	],
	shelf: {
		/* directly corresponds to the main frame */
	},
	mainItem: {
		/* the item under focus at the moment */
	},
}

const dispatchDictionary = {
	push: pushMainFrame,
	pop: popMainFrame,
}

export default function ATP_Reducer(state, action) {
	if (action.type && dispatchDictionary[action.type])
		dispatchDictionary[action.type](state, action.value)
}

function pushMainFrame(state, frame) {
	const stack = state.mainFrame
	stack.push(frame)
	return { ...state, mainFrame: stack }
}

function popMainFrame(state) {
	const stack = state.mainFrame
	stack.pop()
	return { ...state, mainFrame: stack}
}
