import React from "react"
import { useGlobalContext } from "../../GlobalContext"
import { cssHelper, MOBILE_BREAKPOINT } from "../../api/cssHelper"
import ButtonWrapper from "../../shared/ButtonWrapper"
import { Stack } from "@mui/system"

const popupCSS = (visible) => {
	const obj = {
		...cssHelper,
		width: "500px",
		height: "500px",
		textAlign: "left",
		fontSize: "32",
		position: "absolute",
		left: "20%",
		top: "20%",
		display: "none",
	}
	if (visible) delete obj.display
	if(window.innerWidth < MOBILE_BREAKPOINT) {
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
			<Stack direction='row' divider={<hr />}>
				<ButtonWrapper
					style={{ width: "min-width" }}
					type='text'
					label='Close'
					onClick={() => {
						closePopup()
					}}
				/>
				<h3 style={{ margin: "auto", textAlign: "center" }}>
					{title}
				</h3>
			</Stack>
			<hr />
			{children}
		</div>
	)
}
