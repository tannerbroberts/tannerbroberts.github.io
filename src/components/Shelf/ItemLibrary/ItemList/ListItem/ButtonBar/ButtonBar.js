import React from 'react'
import { cssHelper, ROW } from '../../../../../../api/cssHelper'
import AddItem from './AddItem/AddItem'
import DeleteItem from './DeleteItem'
import ViewItem from './ViewItem'

const buttonBarCSS = () => {
	const obj = {
		...cssHelper,
		...ROW,
		border: 'none',
		padding: 0,
		gap: 0,
		gridTemplateColumns: '1fr 1fr 1fr 1fr',
	}

	if (screen.width < 1000) {
		obj.gridTemplateColumns = '1fr 1fr'
		obj.height = 'max(100px, 20vh)'
	}

	return obj
}

export default function ButtonBar() {
	return (
		<div style={buttonBarCSS()}>
			<DeleteItem />
			<ViewItem />
			<AddItem />
		</div>
	)
}
