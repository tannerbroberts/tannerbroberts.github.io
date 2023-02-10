import React from 'react'
import { cssHelper, STRUCTURE } from '../../../api/cssHelper'
import ItemFilter from './ItemFilter'
import ItemList from './ItemList'

const itemLibraryCSS = (openState) => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
	}
	if (openState) return obj

	return obj
}

export default function ItemLibrary() {
	return (
		<div style={itemLibraryCSS(true)}>
			<ItemFilter />
			<ItemList />
		</div>
	)
}
