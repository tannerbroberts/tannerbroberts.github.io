import React from 'react'
import { cssHelper } from '../../api/cssHelper'
import { useGlobalContext } from '../../App'
import { Button } from '@mui/material'

const popupHeaderCSS = () => {
	const obj = {
		...cssHelper,
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
			<h3 style={cssHelper}>{popupTitle}</h3>
		</div>
	)
}
