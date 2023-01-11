import React from "react"
import { cssHelper } from "../../../../api/cssHelper"

const itemListCSS = () => {
	const obj = { ...cssHelper }

	return obj
}

export default function ItemList() {
	return <div style={itemListCSS()}>Not filled in yet</div>
}
