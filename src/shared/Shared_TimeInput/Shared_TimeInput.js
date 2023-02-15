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

export default function TimeInput({ millis, setMillis }) {
	let leftoverMillis = millis
	const [days, setDays] = useState(Math.floor(leftoverMillis / timeValues.day))
	leftoverMillis = leftoverMillis % timeValues.day
	const [hours, setHours] = useState(Math.floor(leftoverMillis / timeValues.hour))
	leftoverMillis = leftoverMillis % timeValues.hour
	const [minutes, setMinutes] = useState(Math.floor(leftoverMillis / timeValues.minute))
	leftoverMillis = leftoverMillis % timeValues.minute
	const [seconds, setSeconds] = useState(Math.floor(leftoverMillis / timeValues.second))

	return (
		<div style={timeInputCSS()}>
			<input
				value={days}
				onChange={(e) => {
					setMillis(millis - days * timeValues.day + e.target.value * timeValues.day)
					setDays(e.target.value)
				}}
				type='number'
			/>
			<input
				value={hours}
				onChange={(e) => {
					setMillis(millis - hours * timeValues.hour + e.target.value * timeValues.hour)
					setHours(e.target.value)
				}}
				type='number'
			/>
			<input
				value={minutes}
				onChange={(e) => {
					setMillis(millis - minutes * timeValues.minute + e.target.value * timeValues.minute)
					setMinutes(e.target.value)
				}}
				type='number'
			/>
			<input
				value={seconds}
				onChange={(e) => {
					setMillis(millis - seconds * timeValues.second + e.target.value * timeValues.second)
					setSeconds(e.target.value)
				}}
				type='number'
			/>
		</div>
	)
}
