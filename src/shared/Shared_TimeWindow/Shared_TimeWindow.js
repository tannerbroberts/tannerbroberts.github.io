import React from "react"
import { useGlobalContext } from "../../GlobalContext"
import { getItem } from "../../api/io"
import ScheduledItem from "./ScheduledItem"
import BackgroundSections from "./BackgroundSections"
import TimeScale from "./TimeScale.js/TimeScale"

import { cssHelper } from "../../api/cssHelper"

const timeWindowCSS = () => {
	const obj = {
		...cssHelper,
		position: "relative",
		overflowY: "scroll",
		height: "50vh",
	}

	return obj
}

export default function TimeWindow() {
	const { stack } = useGlobalContext()
	const index = stack.length - 1
	const frame = stack[index]

	// This is the TimeWindow for the main calendar
	if (frame.path === "calendar") {
		return (
			<div>
				This is supposed to be the time window for the main screen
			</div>
		)
	}
	// This is the TimeWindow for an itemView
	else if (frame.path === "itemView") {
		const itemName = frame?.name
		const item = getItem(itemName)
		const itemLength = item?.length
		const children = item?.children

		const scale = 60_000

		return (
			<div>
				<TimeScale />
				<div style={timeWindowCSS()}>
					<BackgroundSections sectionCount={itemLength / scale} />
					{children?.map((child) => (
						<ScheduledItem
							key={child?.name + child?.position}
							name={child?.name}
							position={child?.position}
							length={child?.length}
							scale={scale}
						/>
					))}
				</div>
			</div>
		)
	}
}
