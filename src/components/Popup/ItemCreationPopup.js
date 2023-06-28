import React, { useCallback, useState } from 'react'
import { TextField } from '@mui/material'
import Button from '@mui/material/Button'
import { isIllegalString, postItem } from '../../api/io'
import { useGlobalContext } from '../../App'
import SharedTimeInput from '../../shared/Shared_TimeInput'

export default function ItemCreationPopup() {
	const [millis, setMillis] = useState(0)
	const [itemName, setItemName] = useState()
	const { closePopup } = useGlobalContext()

	const onSubmit = useCallback((e) => {
		e.preventDefault()

		// This object is everything that the item has when it first gets saved
		console.log('posting stats:', e.target.itemName.value, e.target.itemMillis.value)
		const postSuccess = postItem({
			name: e.target.itemName.value,
			length: e.target.itemMillis.value,
		})

		if (postSuccess) closePopup()
	}, [])

	return (
		<form onSubmit={onSubmit}>
			<div style={{ textAlign: 'center' }}>
				<TextField
					id='itemName'
					label='Item Name'
					value={itemName}
					onChange={(e) => setItemName(e.target.value)}
					error={isIllegalString(itemName)}
				/>
				<SharedTimeInput setMillis={setMillis} millis={millis} id='itemMillis' />
			</div>
			<div style={{ textAlign: 'center' }}>
				<Button variant='contained' type='submit'>
					Create
				</Button>
			</div>
		</form>
	)
}
