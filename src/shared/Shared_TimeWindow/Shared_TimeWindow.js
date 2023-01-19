import React, { createContext, useContext, useState } from "react"
import { useGlobalContext } from "../../App"
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
		height: "83vh",
	}

	return obj
}

const TimeWindowContext = createContext()

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
		const parentItem = getItem(itemName)
		const itemLength = parentItem?.length
		const [children, setChildren] = useState(parentItem?.children)

		const removeTimeWindowStateChild = (name, position) => {
			try {
				setChildren(
					children.filter(
						(child) =>
							child.name !== name || child.position !== position
					)
				)
			} catch (err) {
				console.log("ERROR: in f() removeTimeWindowStateChild:", err)
			}
		}

		return (
			<TimeWindowContext.Provider
				value={{ parentItem, removeTimeWindowStateChild }}
			>
				<div>
					<TimeScale />
					<div
						style={timeWindowCSS()}
						id='textFieldInItemSchedulerAddon'
					>
						<BackgroundSections length={itemLength} />
						{children?.map((child) => (
							<ScheduledItem
								key={child?.name + child?.position}
								name={child?.name}
								startMillisProp={child?.position}
							/>
						))}
					</div>
				</div>
			</TimeWindowContext.Provider>
		)
	}
}

export const useTimeWindowContext = () =>
	useContext(TimeWindowContext)
