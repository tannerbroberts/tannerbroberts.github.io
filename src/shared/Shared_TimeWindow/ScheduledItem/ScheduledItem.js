import React, { createContext, useContext, useState } from "react"
import { cssHelper } from "../../../api/cssHelper"
import { getItem } from "../../../api/io"
import { useGlobalContext } from "../../../App"
import useLongPress from "../../../api/useLongPress"
import ItemSchedulerAddon from "./ItemSchedulerAddon"

const scheduledItemCSS = (tempStartMillis, length) => {
	const { scale } = useGlobalContext()
	const obj = {
		...cssHelper,
		position: "absolute",
		top: `${(tempStartMillis / scale) * 100}px`,
		left: "100px",
		width: "calc(100% - 101px)",
		height: `${(length / scale) * 100}px`,
		textAlign: "center",
		padding: "10px",
		backgroundColor: "rgba(155, 255, 155, 1)",
		borderRadius: "10px",
	}

	return obj
}

const ScheduledItemContext = createContext()

export default function ScheduledItem({ name, startMillisProp, scheduling=false }) {
	const [tempStartMillis, setTempStartMillis] =
		useState(startMillisProp)
	const item = getItem(name)
	const { length } = item

	const longPressProps = useLongPress(() => {
		setSchedulerVisible(true)
	})

	const [schedulerVisible, setSchedulerVisible] = useState(scheduling)

	return (
		<ScheduledItemContext.Provider
			value={{
				startMillis: startMillisProp,
				tempStartMillis,
				setTempStartMillis,
				item,
				setSchedulerVisible,
			}}
		>
			<div
				{...longPressProps}
				style={scheduledItemCSS(tempStartMillis, length)}
			>
				{schedulerVisible && <ItemSchedulerAddon />}
				{name}
			</div>
		</ScheduledItemContext.Provider>
	)
}

export const useScheduledItemContext = () =>
	useContext(ScheduledItemContext)
