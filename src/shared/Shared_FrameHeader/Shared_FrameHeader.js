import React from "react"
import {
	useATP_DispatchContext,
	useATP_StateContext,
} from "../../providers/ATP_Context"

export default function Shared_FrameHeader() {
	const state = useATP_StateContext()
	const dispatch = useATP_DispatchContext()
	// Calendar / accounting / itemView
	// Close the frame
	// Save changes
	// Discard changes
	const lastIndex = state.mainStack.length - 1
	const currentFrame = state.mainStack[lastIndex]
	return (
		<div>
			{"Frame Header: " + currentFrame.frameType}
			<button onClick={() => dispatch({ type: "CLOSE_FRAME" })}>
				Close
			</button>
		</div>
	)
}
