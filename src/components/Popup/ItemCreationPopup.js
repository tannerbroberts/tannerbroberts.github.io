/* eslint-disable no-unused-vars */
import React, { useCallback, useState } from "react"
import { TextField } from "@mui/material"
import Button from "@mui/material/Button"
import { isIllegalString, addItem } from "../../api/io"

export default function ItemCreationPopup() {
	const [itemName, setItemName] = useState()

	const onSubmit = useCallback((e) => {
		const getLength = () => {
			let length = 0
			length += e.target.itemDays.value * 86_400_000
			length += e.target.itemHours.value * 3_600_000
			length += e.target.itemMinutes.value * 60_000
			length += e.target.itemSeconds.value * 1_000

			return length
		}
		
		// This object is everything that the item has when it first gets saved
		addItem({ name: e.target.itemName.value, length: getLength() })

		e.preventDefault()
	}, [])

	return (
		<form onSubmit={onSubmit}>
			<div style={{ textAlign: "center" }}>
				<TextField
					id='itemName'
					label='Item Name'
					value={itemName}
					onChange={(e) => setItemName(e.target.value)}
					error={isIllegalString(itemName)}
				/>
			</div>
			<div style={{ marginTop: "20px", textAlign: "center" }}>
				<TextField id='itemDays' label='Days' type='number' />
				<TextField id='itemHours' label='Hours' type='number' />
			</div>
			<div style={{ marginTop: "20px", textAlign: "center" }}>
				<TextField id='itemMinutes' label='Minutes' type='number' />
				<TextField id='itemSeconds' label='Seconds' type='number' />
			</div>
			<div style={{ marginTop: "20px", textAlign: "center" }}>
				<Button variant='contained' type='submit'>
					Create
				</Button>
			</div>
		</form>
	)
}
