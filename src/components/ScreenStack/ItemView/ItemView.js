import React, { useEffect, useState } from "react"
import { useGlobalContext } from "../../../GlobalContext"

export default function ItemView({ name }) {
	const [itemName, setItemName] = useState(name)

	useEffect(() => {
		setItemName(name)
	}, [name])

	const { pushFrame } = useGlobalContext()
	return (
		<h1>
			<input
				value={itemName}
				onChange={(e) => setItemName(e.target.value)}
			/>
			<button
				onClick={() =>
					pushFrame({ path: "itemView", name: itemName })
				}
			>
				push item
			</button>
			Placeholder for ItemView: {name}
		</h1>
	)
}
