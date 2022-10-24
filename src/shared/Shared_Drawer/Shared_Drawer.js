import React, { useState } from "react"
import { cssHelper } from "../../api/cssHelper"

const drawerCSS = (open) => {
	const obj = { ...cssHelper, height: 'min-content' }
	if (open) {
		obj.border = "5px solid black"
	}
	return obj
}

const knobCSS = () => {
	const obj = { ...cssHelper, height: "50px" }

	return obj
}

export default function Shared_Drawer({ children, title }) {
	const [open, setOpen] = useState(false)
	return (
		<div style={drawerCSS(open)}>
			<div style={knobCSS()} onClick={() => setOpen(!open)}>
				{title}
			</div>
			{open ? children : ""}
		</div>
	)
}
