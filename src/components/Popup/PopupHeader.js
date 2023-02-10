import React from 'react'
import { cssHelper } from '../../api/cssHelper'
import { useGlobalContext } from '../../App'
import { Button } from '@mui/material'

const popupHeaderCSS = () => {
	const obj = {
		...cssHelper,
		gridTemplateColumns: '100px 1fr',
		height: 'min-content',
	}

	return obj
}

export default function PopupHeader() {
	const { popupTitle, closePopup } = useGlobalContext()

	return (
		<div style={popupHeaderCSS()}>
			<Button
				type='text'
				onClick={() => {
					closePopup()
				}}
			>
				Close
			</Button>
			<h3>{popupTitle}</h3>
		</div>
	)
}
