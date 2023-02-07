import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import { useGlobalContext } from '../../../App'

const backgroundSectionCSS = (index) => {
	console.log(index)
	const obj = {
		...cssHelper,
		// position: 'absolute',
		// top: `${index * 100}px`,
		// height: '100px',
		// textAlign: 'left',
		// padding: '10px',
	}

	return obj
}

export default function BackgroundSection({ index }) {
	const { unit } = useGlobalContext()
	return <div style={backgroundSectionCSS(index)}>{`${index} ${unit}`}</div>
}
