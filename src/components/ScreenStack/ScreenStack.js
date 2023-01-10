import React, { useState } from "react"
import Accounting from "./Accounting"
import Calendar from "./Calendar"
import ItemView from "./ItemView"
import { ScreenStackProvider } from "./ScreenStackContext"

export default function ScreenStack({ style }) {
	const [count, setCount] = useState(0)
	const [stack, setStack] = useState([{ path: "calendar" }])

	const componentList = ["accounting", "calendar", "itemView"]

	const pushFrame = (obj) => {
		if (componentList.includes(obj.path)) {
			setStack(() => [...stack, obj])
			setCount(() => count + 1)
		}
	}

	const popFrame = () => {
		if (stack.length > 1) {
			setStack(() => stack.slice(0, -1))
			setCount(() => count - 1)
		}
	}

	const getTopPath = () => stack[stack.length - 1]?.path
	const getTopName = () => stack[stack.length - 1]?.name

	return (
		<ScreenStackProvider value={{ pushFrame, popFrame }}>
			<div style={style}>
				<button onClick={popFrame}>Pop</button>
				<span style={{ marginLeft: "10px", display: "inline" }}>
					{count}
				</span>
				{getTopPath() === "accounting" && <Accounting />}
				{getTopPath() === "calendar" && <Calendar />}
				{getTopPath() === "itemView" && (
					<ItemView name={getTopName()} />
				)}
			</div>
		</ScreenStackProvider>
	)
}
