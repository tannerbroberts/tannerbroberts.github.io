import { TextField } from '@mui/material'
import React, { useState } from 'react'
import { timeValues } from '../../api/constants'
import { cssHelper } from '../../api/cssHelper'

const timeInputCSS = () => {
	const obj = {
		...cssHelper,
		padding: 0,
		gap: 0,
		display: 'grid',
		width: 'min(30vw, 300px)',

		gridTemplateColumns: '1fr 1fr 1fr 1fr',

		overflow: 'visible',
	}

	return obj
}

export default function TimeInput({ millis, setMillis, id }) {
	let leftoverMillis = millis
	const [days, setDays] = useState(Math.floor(leftoverMillis / timeValues.day))
	leftoverMillis = leftoverMillis % timeValues.day
	const [hours, setHours] = useState(Math.floor(leftoverMillis / timeValues.hour))
	leftoverMillis = leftoverMillis % timeValues.hour
	const [minutes, setMinutes] = useState(Math.floor(leftoverMillis / timeValues.minute))
	leftoverMillis = leftoverMillis % timeValues.minute
	const [seconds, setSeconds] = useState(Math.floor(leftoverMillis / timeValues.second))

	return (
		<>
			<input id={id} value={millis} type='hidden' />
			<div style={timeInputCSS()}>
				<TextField
					label='days'
					value={days}
					onChange={(e) => {
						try {
							setMillis(millis - days * timeValues.day + e.target.value * timeValues.day)
							setDays(e.target.value)
						} catch (e) {
							console.log(e)
						}
					}}
					type='number'
				/>
				<TextField
					label='hours'
					value={hours}
					onChange={(e) => {
						setMillis(millis - hours * timeValues.hour + e.target.value * timeValues.hour)
						setHours(e.target.value)
					}}
					type='number'
				/>
				<TextField
					label='minutes'
					value={minutes}
					onChange={(e) => {
						setMillis(millis - minutes * timeValues.minute + e.target.value * timeValues.minute)
						setMinutes(e.target.value)
					}}
					type='number'
				/>
				<TextField
					label='seconds'
					value={seconds}
					onChange={(e) => {
						setMillis(millis - seconds * timeValues.second + e.target.value * timeValues.second)
						setSeconds(e.target.value)
					}}
					type='number'
				/>
			</div>
		</>
	)
}
