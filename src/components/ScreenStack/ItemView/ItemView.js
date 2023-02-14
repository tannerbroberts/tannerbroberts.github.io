import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import TimeWindow from '../../../shared/Shared_TimeWindow/Shared_TimeWindow'

const itemViweCSS = () => {
	const obj = {
		...cssHelper,
		overflowY: 'hidden',
		gridTemplateRows: 'min-content',
		padding: 0,
		gap: 0,
	}

	return obj
}

export default function ItemView() {
	return (
		<>
			{/* Variable summary goes here */}
			<div style={itemViweCSS()}>
				<TimeWindow />
			</div>
		</>
	)
}
