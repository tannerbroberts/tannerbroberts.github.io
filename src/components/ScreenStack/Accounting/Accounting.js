import React from 'react'
import { cssHelper } from '../../../api/cssHelper'

const accountingCSS = () => {
	const obj = {
		...cssHelper,
	}

	return obj
}

export default function Accounting() {
	return (
		<div style={accountingCSS()}>
			<h1>Accounting View</h1>
		</div>
	)
}
