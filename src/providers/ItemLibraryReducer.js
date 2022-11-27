export const initialState = {
    itemLibraryDrawerOpen: true,
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

function toggleItemLibraryDrawer(state) {
	return { ...state, itemLibraryDrawerOpen: !state?.itemLibraryDrawerOpen }
}

const dispatchDictionary = {
	TOGGLE_ITEM_LIBRARY_DRAWER: toggleItemLibraryDrawer,
}

export default function ItemLibraryReducer(state, action) {
	if (action.type && dispatchDictionary[action.type])
		return dispatchDictionary[action.type](state, action)
}
