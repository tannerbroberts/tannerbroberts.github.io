/* eslint-disable react/prop-types */
import React, { useState } from "react"

const ShelfToggle = ({ clickListener, shelfText, visible }) => {
	const ShelfToggleCSS = (visible) => {
		const obj = {
			boxSizing: "border-box",
			appearance: "div",
			backgroundColor: "rgba(0, 100, 20, 0.5)",
			borderRadius: "10px 0 0 10px",
			borderRight: "none",
			lineHeight: "100vh",
			marginBottom: "5px",
			marginTop: "5px",
			marginRight: "0px",
			textAlign: "center",
			minWidth: "100px",
			maxWidth: "100px",
		}
		if (!visible) {
			obj.marginRight = "5px"
			obj.borderRadius = "10px"
		}

		return obj
	}

	return (
		<div style={ShelfToggleCSS(visible)} onClick={clickListener}>
			{shelfText}
		</div>
	)
}

export default function Shelf() {
	const [visible, setVisible] = useState(true)
	const [shelfText, setShelfText] = useState(">>>")

	const ShelfCSS = () => {
		const obj = {
			backgroundColor: "rgba(0, 100, 20, 0.2)",
			border: "solid 2px rgba(0, 100, 20, 0.5)",
			borderLeft: "none",
			borderRadius: "0px 10px 10px 0px",
			margin: "5px",
			marginLeft: "0px",
			transition: ".5s",
			width: "50%",
		}
		if (!visible) {
			obj.width = "0px"
			obj.border = "solid 0px rgba(0, 100, 20, 0.0)"
			obj.backgroundColor = "rgba(0, 100, 20, 0.0)"
		}

		return obj
	}

	const clickListener = () => {
		if (visible) setShelfText("<<<")
		else setShelfText(">>>")
		setVisible(!visible)
	}

	return (
		<>
			<ShelfToggle
				visible={visible}
				clickListener={clickListener}
				shelfText={shelfText}
			/>
			<div style={ShelfCSS()}></div>
		</>
	)
}
