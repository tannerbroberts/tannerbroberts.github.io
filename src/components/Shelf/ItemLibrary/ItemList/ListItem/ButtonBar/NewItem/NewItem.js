import { Button } from '@mui/material'
import React from 'react'
import { cssHelper } from '../../../../../../../api/cssHelper'
import { useGlobalContext } from '../../../../../../../App'
import ItemCreationPopup from '../../../../../../Popup/ItemCreationPopup'

const newItemCSS = () => {
	const obj = {
		...cssHelper,
		backgroundColor: 'lightGreen',
		color: 'black',
	}

	return obj
}

export default function NewItem() {
	const { openPopup } = useGlobalContext()
	return (
		<Button style={newItemCSS()} onClick={() => openPopup(<ItemCreationPopup />)}>
			New Item
		</Button>
	)
}
