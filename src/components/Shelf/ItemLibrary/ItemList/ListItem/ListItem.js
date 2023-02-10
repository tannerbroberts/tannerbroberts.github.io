import React, { useState } from 'react'
import { cssHelper, ROW } from '../../../../../api/cssHelper'
import { useGlobalContext } from '../../../../../App'
import ButtonBar from './ButtonBar'

const wrapperForButtonBarCSS = () => {
	const obj = {
		...cssHelper,
		height: 'min-content',
		padding: 0,
		border: 'none',
		gap: 0,
	}

	return obj
}

const listItemCSS = (focused, backgroundColor) => {
	const obj = {
		...cssHelper,
		...ROW,
		backgroundColor: focused ? 'lightgreen' : backgroundColor,
	}

	return obj
}

export default function ListItem({ itemName, focused = false }) {
	const [backgroundColor, setBackgroundColor] = useState('whitesmoke')
	const { setSelectedItemName } = useGlobalContext()
	return (
		<div style={wrapperForButtonBarCSS()}>
			<div
				style={listItemCSS(focused, backgroundColor)}
				onClick={() => {
					if (focused) setSelectedItemName('')
					else setSelectedItemName(itemName)
				}}
				onMouseEnter={() => setBackgroundColor('lightgray')}
				onMouseLeave={() => setBackgroundColor('whitesmoke')}
			>
				{itemName}
			</div>
			{focused && <ButtonBar />}
		</div>
	)
}
