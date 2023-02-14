import React from 'react'
import { Button } from '@mui/material'
import { cssHelper } from '../../../../../../../api/cssHelper'
import { useGlobalContext } from '../../../../../../../App'

const deleteItemCSS = () => {
	const obj = {
		...cssHelper,
		backgroundColor: 'rgb(255, 70, 70)',
		color: 'black',
	}

	return obj
}

export default function DeleteItem() {
	const { deleteSelectedItemFromLibrary } = useGlobalContext()


	return (
		<Button style={deleteItemCSS()} onClick={deleteSelectedItemFromLibrary}>
			Delete Item
		</Button>
	)
}
