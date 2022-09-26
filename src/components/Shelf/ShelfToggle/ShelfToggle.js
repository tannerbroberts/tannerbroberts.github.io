/* eslint-disable react/prop-types */
import React from "react"
import { useATP_StateContext } from "../../../providers/ATP_Context"
import { useATP_DispatchContext } from "../../../providers/ATP_Context"

export default function ShelfToggle() {
	const state = useATP_StateContext()
	const dispatch = useATP_DispatchContext()

	const ShelfToggleCSS = () => {
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
		if (!state?.shelfOpen) {
			obj.marginRight = "5px"
			obj.borderRadius = "10px"
		}

		return obj
	}

	return (
		<div
			style={ShelfToggleCSS()}
			onClick={() => dispatch({ type: "TOGGLE_SHELF" })}
		>
			{state?.shelfOpen ? ">" : "<"}
		</div>
	)
}
