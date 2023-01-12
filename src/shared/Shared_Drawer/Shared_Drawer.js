import React, { useState } from "react"
import { cssHelper, SHARED } from "../../api/cssHelper"

const drawerCSS = () => {
	const obj = { ...cssHelper, ...SHARED }

	return obj
}

const knobCSS = () => {
	const obj = {
		...cssHelper,
		height: "50px",
		...SHARED,
		textAlign: "center",
		fontSize: "30px",
		fontFamily: "monospace",
		lineHeight: "100%",
	}

	return obj
}

export default function Shared_Drawer({ children, title }) {
	const [open, setOpen] = useState(true)
	return (
		<div style={drawerCSS()}>
			<div style={knobCSS()} onClick={() => setOpen(!open)}>
				{`•${title}•`}
			</div>
			{open ? children : ""}
		</div>
	)
}
