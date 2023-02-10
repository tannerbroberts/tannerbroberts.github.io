import React from 'react'
import { cssHelper, SHARED, ROW } from '../../api/cssHelper'
import { useLS } from '../../api/useLS'

const drawerCSS = () => {
	const obj = {
		...cssHelper,
		...SHARED,
		gridTemplateRows: 'min-content',
		width: '100%',
		padding: 0,
		border: 'none',
		gap: 'none',
	}

	return obj
}

const knobCSS = () => {
	const obj = {
		...cssHelper,
		...SHARED,
		...ROW,
	}

	return obj
}

const childWrapper = () => {
	const obj = {
		...cssHelper,
		height: 'min-content',
		padding: 0,
		border: 'none',
	}

	return obj
}

export default function Shared_Drawer({ children, title }) {
	const [open, setOpen] = useLS(title, true)
	return (
		<div style={drawerCSS()}>
			<div style={knobCSS()} onClick={() => setOpen(!open)}>
				{`•${title}•`}
			</div>
			{open ? <div style={childWrapper()}>{children}</div> : ''}
		</div>
	)
}
