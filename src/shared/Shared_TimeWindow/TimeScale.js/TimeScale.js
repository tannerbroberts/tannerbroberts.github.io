import { Button } from "@mui/material"
import React from "react"
import { useGlobalContext } from "../../../App"

const scaleButtonCSS = () => {
	return {
		padding: "10px",
		margin: "10px",
	}
}

export default function TimeScale() {
	const { setScale, setUnit } = useGlobalContext()
	return (
		<div style={{ display: "flex", flexDirection: "row" }}>
			<Button
				variant={"outlined"}
				style={scaleButtonCSS()}
				onClick={() => {
					setScale(1_000)
					setUnit("sec")
				}}
			>
				Seconds
			</Button>
			<Button
				variant={"outlined"}
				style={scaleButtonCSS()}
				onClick={() => {
					setScale(60_000)
					setUnit("min")
				}}
			>
				Minutes
			</Button>
			<Button
				variant={"outlined"}
				style={scaleButtonCSS()}
				onClick={() => {
					setScale(3_600_000)
					setUnit("hr")
				}}
			>
				Hours
			</Button>
			<Button
				variant={"outlined"}
				style={scaleButtonCSS()}
				onClick={() => {
					setScale(86_400_000)
					setUnit("day")
				}}
			>
				Days
			</Button>
			<Button
				variant={"outlined"}
				style={scaleButtonCSS()}
				onClick={() => {
					setScale(31_556_952_000)
					setUnit("yr")
				}}
			>
				Years
			</Button>
		</div>
	)
}
