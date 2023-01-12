import { Stack } from "@mui/system"
import React, { useState } from "react"
import { cssHelper, MOBILE_BREAKPOINT } from "../api/cssHelper"
import ButtonWrapper from "./ButtonWrapper"

const getDirection = () => {
	if (window.innerWidth < MOBILE_BREAKPOINT) {
		return "column"
	} else return "row"
}

export default function TimeLengthPicker({
	largestUnit = "days",
	smallestUnit = "minutes",
}) {
	const [days, setDays] = useState(0)
	const [hours, setHours] = useState(0)
	const [minutes, setMinutes] = useState(0)
	const [seconds, setSeconds] = useState(0)

	console.log(largestUnit, smallestUnit)

	return (
		<div style={{ ...cssHelper, marginTop: "30px" }}>
			<h3>Item Length</h3>
			<Stack direction={getDirection()} columnGap='10px' wrap>
				<span>Days</span>
				<input
					style={{
						width: `${
							Math.max(1, Math.floor(Math.log10(Math.abs(days)))) + 4
						}ch`,
						fontFamily: "monospace",
					}}
					type='number'
					value={days}
					onChange={(e) =>
						setDays(Math.min(365, Math.max(0, e.target.value)))
					}
				/>
				<span>Hours</span>
				<input
					style={{
						width: `${
							Math.max(1, Math.floor(Math.log10(Math.abs(hours)))) + 4
						}ch`,
						fontFamily: "monospace",
					}}
					type='number'
					value={hours}
					onChange={(e) =>
						setHours(Math.min(59, Math.max(0, e.target.value)))
					}
				/>
				<span>Minutes</span>
				<input
					style={{
						width: `${
							Math.max(1, Math.floor(Math.log10(Math.abs(minutes)))) +
							4
						}ch`,
						fontFamily: "monospace",
					}}
					type='number'
					value={minutes}
					onChange={(e) =>
						setMinutes(Math.min(59, Math.max(0, e.target.value)))
					}
				/>
				<span>Seconds</span>
				<input
					style={{
						width: `${
							Math.max(1, Math.floor(Math.log10(Math.abs(seconds)))) +
							4
						}ch`,
						fontFamily: "monospace",
					}}
					type='number'
					value={seconds}
					onChange={(e) =>
						setSeconds(Math.min(59, Math.max(0, e.target.value)))
					}
				/>
			</Stack>
			<ButtonWrapper
				label='Reset'
				onClick={() => {
					setDays(0)
					setHours(0)
					setMinutes(0)
					setSeconds(0)
				}}
			/>
		</div>
	)
}
