import React from "react"
import { cssHelper } from "../../../../../api/cssHelper"

const listItemCSS = () => {
	const obj = { ...cssHelper }

	return obj
}

export default function ListItem({ item }) {
	return <div style={listItemCSS()}>{item?.name}</div>
}
