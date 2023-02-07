import React, { createContext, useContext } from 'react'
import { useGlobalContext } from '../../App'
import { getItem } from '../../api/io'
import ScheduledItem from './ScheduledItem'
import BackgroundSections from './BackgroundSections'
import TimeScale from './TimeScale.js/TimeScale'

import { cssHelper } from '../../api/cssHelper'

const calendarTimeWindowCSS = () => {
	const obj = {
		...cssHelper,
	}

	return obj
}

const timeWindowCSS = () => {
	const obj = {
		...cssHelper,
	}

	return obj
}

const TimeWindowContext = createContext()

export default function TimeWindow() {
	const { stack, children } = useGlobalContext()
	const index = stack.length - 1
	const frame = stack[index]

	// This is the TimeWindow for the main calendar
	if (frame.path === 'calendar') {
		return <div style={calendarTimeWindowCSS()}>This is supposed to be the time window for the main screen</div>
	}
	// This is the TimeWindow for an itemView
	else if (frame.path === 'itemView') {
		const itemName = frame?.name
		const parentItem = getItem(itemName)
		const itemLength = parentItem?.length

		return (
			<TimeWindowContext.Provider value={{ parentItem }}>
				<TimeScale />
				<div style={timeWindowCSS()} id='textFieldInItemSchedulerAddon'>
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
			</TimeWindowContext.Provider>
		)
	}
}

export const useTimeWindowContext = () => useContext(TimeWindowContext)
