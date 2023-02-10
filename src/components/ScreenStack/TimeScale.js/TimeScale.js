import { Button } from '@mui/material'
import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import { useGlobalContext } from '../../../App'
import Shared_Drawer from '../../../shared/Shared_Drawer'

const timeScaleCSS = () => {
	const obj = {
		...cssHelper,
		border: 'none',
		padding: 0,
		gap: 0,
		height: 'min-content',
		gridTemplateColumns: '1fr',
	}

	return obj
}

const scaleButtonCSS = () => {
	const obj = {
		...cssHelper,
		padding: 0,
	}

	return obj
}

const scaleButtonData = [
	{ lengthMillis: 1000, unit: 'sec' },
	{ lengthMillis: 60_000, unit: 'min' },
	{ lengthMillis: 3_600_000, unit: 'hr' },
	{ lengthMillis: 86_400_000, unit: 'day' },
	{ lengthMillis: 31_556_952_000, unit: 'yr' },
]

export default function TimeScale() {
	const { setScale, setUnit } = useGlobalContext()

	return (
		<Shared_Drawer title="time units">
			<div style={timeScaleCSS()}>
				{scaleButtonData.map((data) => (
					<Button
						key={data.lengthMillis}
						style={scaleButtonCSS()}
						variant={'outlined'}
						onClick={() => {
							setScale(data.lengthMillis)
							setUnit(data.unit)
						}}
					>
						{data.unit}
					</Button>
				))}
			</div>
		</Shared_Drawer>
	)
}
