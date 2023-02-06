import React, { useCallback, useState } from 'react'
import { TextField } from '@mui/material'
import Button from '@mui/material/Button'
import { isIllegalString, postItem } from '../../api/io'
import { useGlobalContext } from '../../App'

export default function ItemCreationPopup() {
	const { closePopup } = useGlobalContext()
	const [itemName, setItemName] = useState()

	const onSubmit = useCallback((e) => {
		e.preventDefault()

		const getLength = () => {
			let length = 0
			length += e.target.itemDays.value * 86_400_000
			length += e.target.itemHours.value * 3_600_000
			length += e.target.itemMinutes.value * 60_000
			length += e.target.itemSeconds.value * 1_000

			return length
		}

		// This object is everything that the item has when it first gets saved
		const postSuccess = postItem({
			name: e.target.itemName.value,
			length: getLength(),
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
			</div>
			<div style={{ textAlign: 'center' }}>
				<TextField id='itemDays' label='Days' type='number' />
				<TextField id='itemHours' label='Hours' type='number' />
			</div>
			<div style={{ textAlign: 'center' }}>
				<TextField id='itemMinutes' label='Minutes' type='number' />
				<TextField id='itemSeconds' label='Seconds' type='number' />
			</div>
			<div style={{ textAlign: 'center' }}>
				<Button variant='contained' type='submit'>
					Create
				</Button>
			</div>
		</form>
	)
}
