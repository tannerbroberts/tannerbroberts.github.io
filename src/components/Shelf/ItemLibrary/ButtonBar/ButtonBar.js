import React from "react"
import { color4, cssHelper } from "../../../../api/cssHelper"
import DeleteItem from "./DeleteItem"
import NewItem from "./NewItem"

const buttonBarCSS = () => {
	const obj = {
		...cssHelper,
		...color4,
		gridTemplate: " 1fr / 1fr 1fr",
        textAlign: "center",
	}

	return obj
}

export default function ButtonBar() {
	return <div style={buttonBarCSS()}>
        <NewItem />
        <DeleteItem />
    </div>
}
