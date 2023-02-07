import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import TimeWindow from '../../../shared/Shared_TimeWindow/Shared_TimeWindow'

const itemViweCSS = () => {
	const obj = {
		...cssHelper,
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
