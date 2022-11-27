import React from "react"
import { cssHelper, STRUCTURE } from "../../../../api/cssHelper"
import DeleteItem from "./DeleteItem"
import NewItem from "./NewItem"

const buttonBarCSS = () => {
	const obj = {
		...cssHelper,
		...STRUCTURE,
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
