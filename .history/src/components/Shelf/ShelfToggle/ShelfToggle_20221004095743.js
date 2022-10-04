/* eslint-disable react/prop-types */
import React from "react"
import { useATP_StateContext } from "../../../providers/ATP_Context"
import { useATP_DispatchContext } from "../../../providers/ATP_Context"
import { cssHelper } from '../../../api/cssHelper'

export default function ShelfToggle() {
	const state = useATP_StateContext()
	const dispatch = useATP_DispatchContext()

	const shelfToggleCSS = {
		...cssHelper,
		position: "absolute",
		bottom: "20px",
		right: "20px",
		height: 
	}

	return (
		<div
			style={shelfToggleCSS}
			onClick={() => dispatch({ type: "TOGGLE_SHELF" })}
		>
			{state?.shelfOpen ? ">" : "<"}
		</div>
	)
}
