import React, { useEffect, useState } from "react"
import { useScreenStackContext } from "../ScreenStackContext"

export default function ItemView({ name }) {
	const [itemName, setItemName] = useState(name)

	useEffect(() => {
		setItemName(name)
	}, [name])
	
	const { pushFrame } = useScreenStackContext()
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
