import { useState } from 'react'
import { loadState, saveState } from './io'
export const useLS = (stateName, initialState) => {
	try {
		let savedState = loadState(stateName)
		if (savedState === null) saveState(stateName, initialState)
		savedState = loadState(stateName)
		const [state, setState] = useState(savedState)
		const reallySetState = (newValue) => {
			console.log(`useLS hook saving - - - ${stateName}: ${newValue}`)
			saveState(stateName, newValue)
			setState(newValue)
		}
		return [state, reallySetState]
	} catch (err) {
		console.log(`ERROR in hook: useLS() Saving: ${stateName} Error: ${err}`)
	}
}
