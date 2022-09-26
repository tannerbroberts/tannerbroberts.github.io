/* eslint-disable react/prop-types */
import React from "react"
import ShelfToggle from "./ShelfToggle"
import { useATP_StateContext } from "../../providers/ATP_Context"

export default function Shelf() {
	const state = useATP_StateContext()

	const ShelfCSS = () => {
		const obj = {
			backgroundColor: "rgba(0, 100, 20, 0.2)",
			borderTop: "solid 2px rgba(0, 100, 20, 0.5)",
			borderRight: "solid 2px rgba(0, 100, 20, 0.5)",
			borderBottom: "solid 2px rgba(0, 100, 20, 0.5)",
			borderLeft: "none",
			borderRadius: "0px 10px 10px 0px",
			margin: "5px",
			marginLeft: "0px",
			transition: ".3s",
			width: "50%",
		}
		if (!state?.shelfOpen) {
			obj.width = "0px"
			obj.borderLeft = "solid 0px rgba(0, 100, 20, 0.0)"
			obj.backgroundColor = "rgba(0, 100, 20, 0.0)"
		}

		return obj
	}

	return (
		<>
			<ShelfToggle />
			<div style={ShelfCSS()}></div>
		</>
	)
}
