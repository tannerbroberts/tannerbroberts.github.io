import React from 'react'
import { cssHelper, STRUCTURE } from '../../../../../../api/cssHelper'
import AddItem from './AddItem/AddItem'
import DeleteItem from './DeleteItem'
import NewItem from './NewItem'
import ViewItem from './ViewItem'

const buttonBarCSS = () => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
		gridTemplateColumns: '1fr 1fr 1fr 1fr',
	}

	return obj
}

export default function ButtonBar() {
	return (
		<div style={buttonBarCSS()}>
			<NewItem />
			<DeleteItem />
			<ViewItem />
			<AddItem />
		</div>
	)
}
