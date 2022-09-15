/* eslint-disable react/prop-types */
import React from "react"

export default function ShelfToggle({ visible, setVisible }) {
	const ShelfToggleCSS = (visible) => {
		const obj = {
			backgroundColor: "rgba(0, 100, 20, 0.5)",
			borderRadius: "10px 0 0 10px",
			borderRight: "none",
			boxSizing: "border-box",
			color: "rgba(0, 100, 20, 1)",
			fontFamily: "monospace",
			fontSize: "60px",
			fontWeight: "bolder",
			lineHeight: "95vh",
			marginBottom: "5px",
			marginTop: "5px",
			maxWidth: "100px",
			marginRight: "0px",
			minWidth: "100px",
			textAlign: "center",
			userSelect: "none",
		}
		if (!visible) {
			obj.marginRight = "5px"
			obj.borderRadius = "10px"
		}

		return obj
	}

	return (
		<div
			style={ShelfToggleCSS(visible)}
			onClick={() => setVisible(!visible)}
		>
			{visible ? ">" : "<"}
		</div>
	)
}
