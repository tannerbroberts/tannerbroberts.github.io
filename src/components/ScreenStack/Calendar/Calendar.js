import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import TimeWindow from '../../../shared/Shared_TimeWindow/Shared_TimeWindow'

const calendarCSS = () => {
	const obj = {
		...cssHelper,
	}

	return obj
}

export default function Calendar() {
	return (
		<div style={calendarCSS()}>
			<h1>Calendar Placeholder</h1>
			<TimeWindow />
		</div>
	)
}
