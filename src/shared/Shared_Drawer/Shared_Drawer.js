import React, { useState } from 'react'
import { cssHelper, SHARED } from '../../api/cssHelper'

const drawerCSS = (open) => {
	const obj = { ...cssHelper,
		...SHARED,
		height: open ? '100vh' : 'min-content' ,
		gridTemplateRows: open ? 'max(8vh, 50px) 1fr' : '8vh',
		minHeight: '50px',
		width: '100%',
		padding: 0,
		border: 'none',
		gap: 'none'
	}

	return obj
}

const knobCSS = () => {
	const obj = {
		...cssHelper,
		...SHARED,
		height: open ? '100%' : 'max(50px, 10vh)',
		minHeight: '50px',
		textAlign: 'center',
		fontSize: 'min(3vw, 30px)',
		fontFamily: 'monospace',
		lineHeight: 'max(4.5vh, 25px)',
	}

	return obj
}

export default function Shared_Drawer({ children, title }) {
	const [open, setOpen] = useState(true)
	return (
		<div style={drawerCSS(open)}>
			<div style={knobCSS()} onClick={() => setOpen(!open)}>
				{`•${title}•`}
			</div>
			{open ? children : ''}
		</div>
	)
}
