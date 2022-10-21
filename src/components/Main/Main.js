/* eslint-disable react/prop-types */
import React from "react"
import { cssHelper } from "../../api/cssHelper"
import { useATP_StateContext } from "../../providers/ATP_Context"
import Calendar from './Calendar'
import ItemView from './ItemView'
import Accounting from './Accounting'

const MainCSS = {
	...cssHelper,
}

const CurrentFrame = ({ state }) => {
	const lastIndex = state.mainStack.length - 1
	const currentFrame = state.mainStack[lastIndex]

	// Add to this as more types of main frame become necessary
	switch(currentFrame.frameType) {
		case 'Calendar': return <Calendar />
		case 'ItemView': return <ItemView />
		case 'Accounting': return <Accounting />
	}
}

export default function Main() {
	// const appDispatch = useATP_DispatchContext()
	const appState = useATP_StateContext()
	return <div style={MainCSS}>
		<CurrentFrame state={appState} />
	</div>
}
