import React, { useState } from 'react'
import { cssHelper } from '../../../../api/cssHelper'
import { getLibrary } from '../../../../api/io'
import { useGlobalContext } from '../../../../App'

const itemListCSS = () => {
	const obj = { ...cssHelper }

	return obj
}

const rowCSS = (backgroundColor) => {
	const obj = {
		...cssHelper,
		backgroundColor,
	}

	return obj
}

const Row = ({ itemName, setSelectedItemName, selectedItemName }) => {
	const [backgroundColor, setBackgroundColor] = useState('whitesmoke')

	return (
		<div
			style={rowCSS(backgroundColor)}
			onMouseEnter={() => setBackgroundColor('lightgray')}
			onMouseLeave={() => setBackgroundColor('whitesmoke')}
			onClick={() => {
				if (selectedItemName === itemName) setSelectedItemName(null)
				else setSelectedItemName(itemName)
			}}
		>
			{itemName}
		</div>
	)
}

export default function ItemList() {
	const library = getLibrary()
	const { setSelectedItemName, selectedItemName } = useGlobalContext()
	return (
		<div style={itemListCSS()}>
			{library.map((itemName) => {
				if (itemName != '*')
					return (
						<Row
							key={Math.random()}
							itemName={itemName}
							setSelectedItemName={setSelectedItemName}
							selectedItemName={selectedItemName}
						/>
					)
			})}
		</div>
	)
}
