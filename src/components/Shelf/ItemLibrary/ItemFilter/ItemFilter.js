import React from "react"
import { cssHelper } from "../../../../api/cssHelper"

const itemFilterCSS = () => {
	const obj = { ...cssHelper }

	return obj
}

export default function ItemFilter() {
	return <div style={itemFilterCSS()}>Item Filter placeholder</div>
}
