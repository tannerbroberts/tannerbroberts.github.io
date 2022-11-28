import React from "react"
import { useATP_StateContext } from "../../providers/ATP_Context"
import { getItem } from "../../api/io"
import ScheduledItem from "./ScheduledItem"

import { cssHelper } from "../../api/cssHelper"

const timeWindowCSS = () => {
	const obj = cssHelper

	return obj
}

export default function TimeWindow() {
	const { mainStack } = useATP_StateContext()
    const index = mainStack.length - 1
    const frame = mainStack[index]
    const itemName = frame.value
	const item = getItem(itemName)
	const children = item?.children
	return (
		<div style={timeWindowCSS()}>
			<div>{itemName}: Has {item?.children.length} children</div>
			{children.map((child) => (
				<ScheduledItem
					key={child?.name + child?.position}
					name={child?.name}
					position={child?.position}
					length={child?.length}
				/>
			))}
		</div>
	)
}
