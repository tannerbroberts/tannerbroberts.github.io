import React, { useState } from 'react'
import { cssHelper, SHARED } from '../../api/cssHelper'

const drawerCSS = (open) => {
	const obj = { ...cssHelper, ...SHARED, height: 'min-content', width: '100%', padding: 0, border: 'none', gap: 'none' }

	if (open) {
		obj.gridTemplateRows = '10vh 1fr'
	} else obj.gridTemplateRows = '10vh'

	return obj
}

const knobCSS = () => {
	const obj = {
		...cssHelper,
		...SHARED,
		height: '100%',
		textAlign: 'center',
		fontSize: '30px',
		fontFamily: 'monospace',
		lineHeight: '6vh',
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
