import React, { useState } from "react"
import {
	useATP_DispatchContext,
	useATP_StateContext,
} from "../../providers/ATP_Context"
import { cssHelper } from "../../api/cssHelper"

const popupCSS = (visible) => {
	const obj = {
		...cssHelper,
		width: "500px",
		height: "500px",
		textAlign: "center",
		fontSize: "32",
		position: "absolute",
		left: "20%",
		top: "20%",
		display: "none",
	}
	if (visible) delete obj.display

	return obj
}

export default function Popup() {
	const dispatch = useATP_DispatchContext()
	const { popupVisible } = useATP_StateContext()
	const [itemName, setItemName] = useState("")
	const [itemLength, setItemLength] = useState("")

	return (
		<div style={popupCSS(popupVisible)}>
			<label htmlFor='itemName'>
				Item Name
				<input
					id='itemName'
					value={itemName}
					onChange={(e) => setItemName(e.target.value)}
				/>
			</label>
			<label htmlFor='itemDuration'>
				Item Duration
				<input
					id='itemDuration'
					value={itemLength}
					onChange={(e) => setItemLength(e.target.value)}
				/>
			</label>
			<button
				onClick={() =>
					dispatch({
						type: "CREATE_ITEM",
						value: {
							name: itemName,
							length: itemLength,
							children: [],
						},
					})
				}
			>
				Create
			</button>
		</div>
	)
}
