import React, { useState } from "react"
import Accounting from "./Accounting"
import Calendar from "./Calendar"
import ItemView from "./ItemView"
import { ScreenStackProvider } from "./ScreenStackContext"
import { cssHelper } from "../../api/cssHelper"
import BreadCrumbsWrapper from "./BreadCrumbsWrapper/BreadCrumbsWrapper"

const screenStackCSS = () => {
	return {
		...cssHelper,
		position: "relative",
	}
}

export default function ScreenStack() {
	const [count, setCount] = useState(1)
	const [stack, setStack] = useState([{ path: "calendar" }])

	const componentList = ["accounting", "calendar", "itemView"]

	const pushFrame = (obj) => {
		if (obj && componentList.includes(obj.path) && obj.name) {
			setStack(() => [...stack, obj])
			setCount(() => count + 1)
		}
	}

	const popFrames = (popCount) => {
		if (stack.length > 1 && stack.length > popCount - 1) {
			setStack(() => stack.slice(0, popCount * -1))
			setCount(() => count - popCount)
		}
	}

	const getTopPath = () => stack[stack.length - 1]?.path
	const getTopName = () => {
		return stack[stack.length - 1]?.name
	}

	return (
		<ScreenStackProvider value={{ pushFrame, popFrames }}>
			<div style={screenStackCSS()}>
				<BreadCrumbsWrapper objects={stack} />
				{getTopPath() === "accounting" && <Accounting />}
				{getTopPath() === "calendar" && <Calendar />}
				{getTopPath() === "itemView" && (
					<ItemView name={getTopName()} />
				)}
			</div>
		</ScreenStackProvider>
	)
}
