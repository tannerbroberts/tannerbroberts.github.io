import React from 'react'
import { cssHelper, ROW } from '../../../../api/cssHelper'

const itemFilterCSS = () => {
	const obj = { ...cssHelper, ...ROW }

	return obj
}

export default function ItemFilter() {
	return <div style={itemFilterCSS()}>Item Filter placeholder</div>
}
