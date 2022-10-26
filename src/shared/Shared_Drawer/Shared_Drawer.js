import React, { useState } from "react"
import { cssHelper, color3 } from "../../api/cssHelper"

const drawerCSS = () => {
	const obj = { ...cssHelper, ...color3 }

	return obj
}

const knobCSS = () => {
	const obj = { ...cssHelper, height: "50px", ...color3 }

	return obj
}

export default function Shared_Drawer({ children, title }) {
	const [open, setOpen] = useState(false)
	return (
		<div style={drawerCSS()}>
			<div style={knobCSS()} onClick={() => setOpen(!open)}>
				{title}
			</div>
			{open ? children : ""}
		</div>
	)
}
