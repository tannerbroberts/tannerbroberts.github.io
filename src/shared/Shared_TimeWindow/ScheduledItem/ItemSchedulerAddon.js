import { Button } from '@mui/material'
import React from 'react'
import { cssHelper } from '../../../api/cssHelper'
import { updateItem } from '../../../api/io'
import { useGlobalContext } from '../../../App'
import Shared_TimeInput from '../../Shared_TimeInput'
import { useScheduledItemContext } from './ScheduledItem'

const itemSchedulerAddonCSS = () => {
	const obj = {
		...cssHelper,
		gap: 0,
		padding: 0,

		position: 'absolute',

		zIndex: 1,

		borderRadius: '10px',
		backgroundColor: 'rgba(155, 255, 155, 0.9)',
		height: 'max(10vh, 100px)',

		justifyContent: 'center',
		alignItems: 'center',
	}

	return obj
}

export default function ItemSchedulerAddon() {
	const { timeWindowBaseItem, setTimeWindowBaseItem } = useGlobalContext()
	const { startMillis, tempStartMillis, setTempStartMillis, item, setSchedulerVisible } = useScheduledItemContext()

	const onSaveListener = () => {
		const filteredArray = timeWindowBaseItem.children.filter((childObj) => {
			return !(childObj?.name === item?.name && childObj?.position === startMillis)
		})
		let newChildList
		if (filteredArray instanceof Array) newChildList = [...filteredArray, { name: item.name, position: tempStartMillis }]
		else console.log('ERROR: in f(): ItemSchedulerAddon: onSaveListener')

		const newCurrentItem = {
			...timeWindowBaseItem,
			children: newChildList,
		}

		updateItem(newCurrentItem)
		setTimeWindowBaseItem(newCurrentItem)

		setSchedulerVisible(false)
	}

	const onRemoveListener = () => {
		const newChildList =
			timeWindowBaseItem.children.filter((childObj) => {
				return childObj.name !== item.name || childObj.position !== startMillis
			}) ?? []

		const newItemViewed = {
			...timeWindowBaseItem,
			children: newChildList,
		}

		updateItem(newItemViewed)
		setTimeWindowBaseItem(newItemViewed)
		setSchedulerVisible(false)
	}

	console.log('addon tempStartMillis', tempStartMillis);

	return (
		<div style={itemSchedulerAddonCSS()}>
			<div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', alignItems: 'center' }}>
				<label>Start time:</label>
				<Shared_TimeInput
					millis={tempStartMillis}
					setMillis={setTempStartMillis}
				/>
				<Button onClick={onSaveListener}>Save</Button>
				<Button onClick={onRemoveListener}>Remove</Button>
			</div>
		</div>
	)
}
