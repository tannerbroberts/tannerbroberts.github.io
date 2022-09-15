/* eslint-disable react/prop-types */
import React, { useState } from "react"
import ShelfToggle from "./ShelfToggle"

export default function Shelf() {
	const [visible, setVisible] = useState(true)

	const ShelfCSS = () => {
		const obj = {
			backgroundColor: "rgba(0, 100, 20, 0.2)",
			border: "solid 2px rgba(0, 100, 20, 0.5)",
			borderLeft: "none",
			borderRadius: "0px 10px 10px 0px",
			margin: "5px",
			marginLeft: "0px",
			transition: ".3s",
			width: "50%",
		}
		if (!visible) {
			obj.width = "0px"
			obj.border = "solid 0px rgba(0, 100, 20, 0.0)"
			obj.backgroundColor = "rgba(0, 100, 20, 0.0)"
		}

		return obj
	}

	return (
		<>
			<ShelfToggle
				visible={visible}
				setVisible={setVisible}
			/>
			<div style={ShelfCSS()}></div>
		</>
	)
}
