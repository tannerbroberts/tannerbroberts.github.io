import React from 'react'
import { cssHelper, STRUCTURE } from '../../api/cssHelper'
import ItemLibrary from './ItemLibrary'
import Shared_Drawer from '../../shared/Shared_Drawer'
import { useGlobalContext } from '../../App'

const shelfCSS = (openStatus) => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
		// gridTemplateRows: 'min-content',
		// overflowY: 'scroll',
		// // Just to make sure it fits the whole screen
		// overflowX: 'hidden',
		// position: 'absolute',
		// top: 0,
		// bottom: 0,
		// left: 0,
		// right: 0,
		// zIndex: 1,
	}
	openStatus ? null : (obj.display = 'none')

	return obj
}

export default function Shelf() {
	const { shelfOpen } = useGlobalContext()
	return (
		<div style={shelfCSS(shelfOpen)}>
			<Shared_Drawer title='Item Library'>
				<ItemLibrary />
			</Shared_Drawer>
		</div>
	)
}
