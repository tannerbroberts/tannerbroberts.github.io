import React from 'react'
import { useGlobalContext } from '../../App'
import { getItem } from '../../api/io'
import ScheduledItem from './ScheduledItem'
import BackgroundSections from './BackgroundSections'

import { cssHelper } from '../../api/cssHelper'

const theLongTimeContainer = () => {
	const obj = {
		...cssHelper,
		padding: 0,
		gap: 0,
		gridTemplateRows: 'min-content',
		alignContent: 'start',
		border: 'none',
		position: 'relative',
	}

	return obj
}

const theWindowThatScrolls = () => {
	const obj = {
		...cssHelper,
		height: '80vh',
		overflowY: 'scroll',
		border: 'none',
		padding: 0,
		gap: 0,
	}

	return obj
}

export default function TimeWindow() {
	const { stack, timeWindowBaseItem } = useGlobalContext()
	const index = stack.length - 1
	const frame = stack[index]
	const itemName = frame?.name
	const parentItem = getItem(itemName)
	const itemLength = parentItem?.length

	return (
		<div style={theWindowThatScrolls()}>
			<div style={theLongTimeContainer()} id='textFieldInItemSchedulerAddon'>
				<BackgroundSections length={itemLength} />
				{timeWindowBaseItem?.children?.map((child) => (
					<ScheduledItem
						key={child?.name + child?.position}
						name={child?.name}
						startMillisProp={child?.position}
						scheduling={child?.scheduling}
					/>
				))}
			</div>
		</div>
	)
}
