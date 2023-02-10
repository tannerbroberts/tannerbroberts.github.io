import React, { createContext, useContext } from 'react'
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
		border: 'none',
		position: 'relative',
	}

	return obj
}

const theWindowThatScrolls = () => {
	const obj = {
		...cssHelper,
		overflowY: 'scroll',
		border: 'none',
		padding: 0,
		gap: 0,
	}

	return obj
}

const TimeWindowContext = createContext()

export default function TimeWindow() {
	const { stack, children } = useGlobalContext()
	const index = stack.length - 1
	const frame = stack[index]
	const itemName = frame?.name
	const parentItem = getItem(itemName)
	const itemLength = parentItem?.length

	return (
		<TimeWindowContext.Provider value={{ parentItem }}>
			<div style={theWindowThatScrolls()}>
				<div style={theLongTimeContainer()} id='textFieldInItemSchedulerAddon'>
					<BackgroundSections length={itemLength} />
					{children?.map((child) => (
						<ScheduledItem
							key={child?.name + child?.position}
							name={child?.name}
							startMillisProp={child?.position}
							scheduling={child?.scheduling}
						/>
					))}
				</div>
			</div>
		</TimeWindowContext.Provider>
	)
}

export const useTimeWindowContext = () => useContext(TimeWindowContext)
