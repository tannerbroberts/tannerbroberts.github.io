import React from 'react'
import { Button } from '@mui/material'
import { useGlobalContext } from '../../../../../../../App'
import { cssHelper } from '../../../../../../../api/cssHelper'

const addItemCSS = () => {
	const obj = {
		...cssHelper,
		backgroundColor: 'lightblue',
		color: 'black',
	}

	return obj
}

export default function AddItem() {
	const { addSelectedItemToCurrentItemViewed } = useGlobalContext()

	return (
		<Button style={addItemCSS()} variant='contained' onClick={() => addSelectedItemToCurrentItemViewed()}>
			Add Item
		</Button>
	)
}
