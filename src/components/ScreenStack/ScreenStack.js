import React from 'react'
import Accounting from './Accounting'
import Calendar from './Calendar'
import ItemView from './ItemView'
import { cssHelper } from '../../api/cssHelper'
import BreadCrumbsWrapper from './BreadCrumbsWrapper/BreadCrumbsWrapper'
import { useGlobalContext } from '../../App'

const screenStackCSS = () => {
	return {
		...cssHelper,
		width: '100%',
		height: '100%',
		padding: 0,
		gridTemplateRows: "5fr 95fr",
		gap: 0,
	}
}

export default function ScreenStack() {
	const { stack } = useGlobalContext()

	const getTopPath = () => stack[stack.length - 1]?.path
	const getTopName = () => {
		return stack[stack.length - 1]?.name
	}

	return (
		<div style={screenStackCSS()}>
			<BreadCrumbsWrapper objects={stack} />
			{getTopPath() === 'accounting' && <Accounting />}
			{getTopPath() === 'calendar' && <Calendar />}
			{getTopPath() === 'itemView' && <ItemView itemName={getTopName()} />}
		</div>
	)
}
