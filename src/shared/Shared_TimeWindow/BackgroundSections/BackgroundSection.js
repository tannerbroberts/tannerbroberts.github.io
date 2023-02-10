import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import { useGlobalContext } from '../../../App'

const backgroundSectionCSS = () => {
	const obj = {
		...cssHelper,
		height: '100px',
		textAlign: 'left',
		padding: '10px',
		border: 'none',
		borderBottom: '1px solid gray'
	}

	return obj
}

export default function BackgroundSection({ index }) {
	const { unit } = useGlobalContext()
	return <div style={backgroundSectionCSS(index)}>{`${index} ${unit}`}</div>
}
