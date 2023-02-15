import React, { useCallback, useState } from 'react'
import { TextField } from '@mui/material'
import Button from '@mui/material/Button'
import { isIllegalString, postItem } from '../../api/io'
import { useGlobalContext } from '../../App'
import TimeInput from '../../shared/Shared_TimeInput'

export default function ItemCreationPopup() {
	const [millis, setMillis] = useState()
	const [itemName, setItemName] = useState()
	const { closePopup } = useGlobalContext()

	const onSubmit = useCallback((e) => {
		e.preventDefault()

		// This object is everything that the item has when it first gets saved
		const postSuccess = postItem({
			name: e.target.itemName.value,
			length: millis,
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
			<TimeInput setMillis={setMillis} millis={millis} />
			</div>
			<div style={{ textAlign: 'center' }}>
				<Button variant='contained' type='submit'>
					Create
				</Button>
			</div>
		</form>
	)
}
