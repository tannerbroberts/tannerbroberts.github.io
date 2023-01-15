import React from "react"
import { useGlobalContext } from "../../GlobalContext"
import { cssHelper, MOBILE_BREAKPOINT } from "../../api/cssHelper"
import { Button } from "@mui/material"

const popupCSS = (visible) => {
	const obj = {
		...cssHelper,
		width: "500px",
		height: "min-content",
		paddingBottom: "20px",
		fontSize: "32",
		position: "absolute",
		left: "20%",
		top: "20%",
		display: "grid",
		gap: "10px",
		overflowY: "scroll",
		gridTemplateColumns: "1fr",
	}
	if (!visible) obj.display = "none"
	if (window.innerWidth < MOBILE_BREAKPOINT) {
		obj.position = "absolute"
		obj.width = "90vw"
		obj.height = "90vh"
		obj.left = "5vw"
		obj.top = "5vh"
	}

	return obj
}

export default function Popup({ children, title }) {
	const { popupOpen, closePopup } = useGlobalContext()

	return (
		<div style={popupCSS(popupOpen)}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-around",
					alignItems: "center",
				}}
			>
				<Button
					style={{ justifySelf: "start" }}
					type='text'
					onClick={() => {
						closePopup()
					}}
				>
					Close
				</Button>
				<h3>{title}</h3>
			</div>
			<hr />
			{children}
		</div>
	)
}
