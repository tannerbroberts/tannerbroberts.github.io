import { Button, TextField } from '@mui/material'
import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import { postChildPositionChange, postChildRemove } from '../../../api/io'
import { useGlobalContext } from '../../../App'
import { useTimeWindowContext } from '../Shared_TimeWindow'
import { useScheduledItemContext } from './ScheduledItem'

const itemSchedulerAddonCSS = () => {
	const obj = {
		...cssHelper,
		// borderRadius: "0 0 10px 10px",
		// backgroundColor: "lightgreen",
		// position: "absolute",
		// top: 0,
		// padding: "10px",
	}

	return obj
}

export default function ItemSchedulerAddon() {
	const { scale, unit } = useGlobalContext()
	const { parentItem, removeTimeWindowStateChild } = useTimeWindowContext()
	const { startMillis, tempStartMillis, setTempStartMillis, item, setSchedulerVisible } = useScheduledItemContext()

	const onSaveListener = () => {
		const newChildList = [
			...parentItem.children.filter((childObj) => {
				return childObj?.name !== item?.name || childObj?.position !== startMillis
			}),
			{ name: item.name, position: tempStartMillis },
		]

		postChildPositionChange({
			...parentItem,
			children: newChildList,
		})
		setSchedulerVisible(false)
	}

	const onRemoveListener = () => {
		const newChildList = parentItem.children.filter((childObj) => {
			return childObj?.name !== item?.name || childObj?.position !== startMillis
		})
		postChildRemove({
			...parentItem,
			children: newChildList,
		})
		removeTimeWindowStateChild(item.name, startMillis)
		setSchedulerVisible(false)
	}

	return (
		<div style={itemSchedulerAddonCSS()}>
			** Select start time **
			<br />
			<div style={{ display: 'flex', flexFlow: 'row' }}>
				<TextField
					type='number'
					label={unit}
					value={tempStartMillis / scale}
					style={{
						width: `${Math.floor(Math.log10(tempStartMillis / scale)) + 9}ch`,
					}}
					onChange={(e) => {
						setTempStartMillis(e.target.value * scale)
						const scrollingContainer =
							e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

						scrollingContainer.scrollTo({
							top: e.target.value * 100,
							left: 0,
							behavior: 'smooth',
						})
					}}
				/>
				<Button onClick={onSaveListener}>Save</Button>
				<Button onClick={onRemoveListener}>Remove</Button>
			</div>
		</div>
	)
}
