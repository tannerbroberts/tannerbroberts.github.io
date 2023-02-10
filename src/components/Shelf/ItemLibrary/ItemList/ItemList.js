import React from 'react'
import { cssHelper } from '../../../../api/cssHelper'
import { getLibrary } from '../../../../api/io'
import { useGlobalContext } from '../../../../App'
import ListItem from './ListItem/ListItem'

const itemListCSS = () => {
	const obj = {
		...cssHelper,
		height: '90vh',
		gridTemplateRows: 'min-content',
	}

	return obj
}

export default function ItemList() {
	const library = getLibrary()
	const { selectedItemName } = useGlobalContext()
	return (
		<div style={itemListCSS()}>
			{library.map((itemName) => {
				if (itemName != '*') return <ListItem key={Math.random()} itemName={itemName} focused={itemName === selectedItemName} />
			})}
		</div>
	)
}
