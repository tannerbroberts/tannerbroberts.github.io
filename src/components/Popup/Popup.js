import React from 'react'
import { useGlobalContext } from '../../App'
import { cssHelper } from '../../api/cssHelper'
import PopupHeader from './PopupHeader'

const popupCSS = (visible) => {
	const obj = {
		...cssHelper,
		// fontSize: "32",
		// position: "absolute",
		// left: "2vw",
		// top: "2vh",
		// width: "96vw",
		// height: "96vh",
		// display: "grid",
		// gap: "10px",
		// overflowY: "scroll",
		// gridTemplateColumns: "1fr",
	}
	if (!visible) obj.display = 'none'

	return obj
}

export default function Popup({ children }) {
	const { popupOpen } = useGlobalContext()

	return (
		<div style={popupCSS(popupOpen)}>
			<PopupHeader />
			<hr />
			{children}
		</div>
	)
}
