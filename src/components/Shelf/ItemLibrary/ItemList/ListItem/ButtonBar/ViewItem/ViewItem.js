import { Button } from '@mui/material'
import React from 'react'
import { cssHelper } from '../../../../../../../api/cssHelper'
import { useGlobalContext } from '../../../../../../../App'

const viewItemCSS = () => {
	const obj = cssHelper

	return obj
}

export default function ViewItem() {
	const { pushItemViewFrame } = useGlobalContext()
	return (
		<Button
			style={viewItemCSS()}
			onClick={() => {
				pushItemViewFrame()
			}}
		>
			View Item
		</Button>
	)
}
