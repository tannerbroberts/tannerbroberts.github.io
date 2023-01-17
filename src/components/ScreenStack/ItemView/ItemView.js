import React from "react"
import { getItem } from "../../../api/io"

export default function ItemView({ itemName }) {
	const frameItem = getItem(itemName)

	return (
		<>
			<h1>Placeholder for ItemView: {itemName}</h1>
			<p>
				{Object.entries(frameItem).map((key) => (
					<p key={Math.random()}>{`${key[0]}: ${key[1]}`}</p>
				))}
			</p>
		</>
	)
}
