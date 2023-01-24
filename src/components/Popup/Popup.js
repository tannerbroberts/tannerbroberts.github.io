import React from "react"
import { useGlobalContext } from "../../App"
import { cssHelper } from "../../api/cssHelper"
import { Button } from "@mui/material"

const popupCSS = (visible) => {
	const obj = {
		...cssHelper,
		fontSize: "32",
		position: "absolute",
		left: "2vw",
		top: "2vh",
		width: "96vw",
		height: "96vh",
		display: "grid",
		gap: "10px",
		overflowY: "scroll",
		gridTemplateColumns: "1fr",
	}
	if (!visible) obj.display = "none"

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
