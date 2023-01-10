import React, { useState } from "react"
import Accounting from "./Accounting"
import Calendar from "./Calendar"
import ItemView from "./ItemView"
import { ScreenStackProvider } from "./ScreenStackContext"
import { cssHelper } from "../../api/cssHelper"

export default function ScreenStack() {
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
			<div
				style={{
					...cssHelper,
					height: "95vh",
					width: "95vw",
					marginTop: "10px",
					position: "relative",
				}}
			>
				<h1>Screen Stack</h1>
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
