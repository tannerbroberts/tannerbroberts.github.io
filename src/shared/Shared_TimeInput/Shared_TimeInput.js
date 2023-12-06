import { TextField } from '@mui/material'
import React, { useState } from 'react'
import { TIME_VALUES } from '../../api/constants'
import { cssHelper } from '../../api/cssHelper'

const timeInputCSS = () => {
	const obj = {
		...cssHelper,
		gap: 0,
		padding: '5%',
		display: 'grid',

		height: 'min-content',

		gridTemplateColumns: screen.width > 500 ? '1fr 1fr 1fr 1fr' : '1fr 1fr',
	}

	return obj
}

export default function TimeInput({ millis, setMillis, id }) {
	if (!id) console.log('ERROR, you need to have an id for the Shared_TimeInput component')
	if (!id) console.log('ERROR, you need to have millis for the Shared_TimeInput component')
	if (!id) console.log('ERROR, you need to have setMillis for the Shared_TimeInput component')
	let leftoverMillis = millis
	const [days, setDays] = useState(Math.floor(leftoverMillis / TIME_VALUES.day))
	leftoverMillis = leftoverMillis % TIME_VALUES.day
	const [hours, setHours] = useState(Math.floor(leftoverMillis / TIME_VALUES.hour))
	leftoverMillis = leftoverMillis % TIME_VALUES.hour
	const [minutes, setMinutes] = useState(Math.floor(leftoverMillis / TIME_VALUES.minute))
	leftoverMillis = leftoverMillis % TIME_VALUES.minute
	const [seconds, setSeconds] = useState(Math.floor(leftoverMillis / TIME_VALUES.second))

	return (
		<>
			<input id={id} value={millis} type='hidden' />
			<div style={timeInputCSS()}>
				<TextField
					label='days'
					value={days}
					onChange={(e) => {
						try {
							setMillis(millis - days * TIME_VALUES.day + e.target.value * TIME_VALUES.day)
							setDays(e.target.value)
						} catch (e) {
							console.log('ERROR, something wrong with the Shared_TimeInput math')
						}
					}}
					type='number'
				/>
				<TextField
					label='hours'
					value={hours}
					onChange={(e) => {
						setMillis(millis - hours * TIME_VALUES.hour + e.target.value * TIME_VALUES.hour)
						setHours(e.target.value)
					}}
					type='number'
				/>
				<TextField
					label='minutes'
					value={minutes}
					onChange={(e) => {
						setMillis(millis - minutes * TIME_VALUES.minute + e.target.value * TIME_VALUES.minute)
						setMinutes(e.target.value)
					}}
					type='number'
				/>
				<TextField
					label='seconds'
					value={seconds}
					onChange={(e) => {
						setMillis(millis - seconds * TIME_VALUES.second + e.target.value * TIME_VALUES.second)
						setSeconds(e.target.value)
					}}
					type='number'
				/>
			</div>
		</>
	)
}
