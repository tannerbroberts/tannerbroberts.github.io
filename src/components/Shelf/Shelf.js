import React from 'react'
import { cssHelper } from '../../api/cssHelper'
import ItemLibrary from './ItemLibrary'
import Shared_Drawer from '../../shared/Shared_Drawer'
import { useGlobalContext } from '../../App'
import NewItem from './NewItem/NewItem'

const shelfCSS = (shelfOpen) => {
	const obj = {
		...cssHelper,
		width: '100%',
		height: '100%',
		overflowY: 'scroll',
		// The following breaks pattern by allowing the children to say how much height they themselves will take
		// This is because there will be a variable number of shelves in the future.
		gridTemplateRows: 'min-content',
	}
	shelfOpen ? null : (obj.display = 'none')

	return obj
}

export default function Shelf() {
	const { shelfOpen } = useGlobalContext()
	return (
		<div style={shelfCSS(shelfOpen)}>
			<NewItem />
			<Shared_Drawer title='Item Library'>
				<ItemLibrary />
			</Shared_Drawer>
		</div>
	)
}
