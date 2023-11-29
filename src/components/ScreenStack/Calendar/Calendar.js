import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import { getLibrary } from '../../../api/io'
// import TimeWindow from '../../../shared/Shared_TimeWindow/Shared_TimeWindow'

const calendarCSS = () => {
	const obj = {
		...cssHelper,
	}

	return obj
}

export default function Calendar() {
	const library = getLibrary()
	return (
		<div style={calendarCSS()}>
			{/*
				I need a variety of views for the calendar:
					1. A view of the whole year
					2. A view of the whole month
					3. A view of the whole week
					4. A view of the whole day
					5. A view for the task at hand

				It doesn't help that I want each view to be highly satisfying to look at.
			*/}
		</div>
	)
}
