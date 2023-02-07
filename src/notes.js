// Set the composite item in LS

export const setls = () => {
	localStorage.setItem(
		'*ITEM*composite',
		JSON.stringify({ name: 'composite', length: 3_600_000, children: [{ name: 'bacon_eggs', position: 0 }] })
	)
	localStorage.setItem('*ITEM*bacon_eggs', JSON.stringify({ name: 'bacon_eggs', length: 3_600_000 }))
	localStorage.setItem('*ITEM*bacon_eggs1/3', JSON.stringify({ name: 'bacon_eggs1/3', length: 1_200_000 }))
	localStorage.setItem('*ITEM*bacon_eggs2/3', JSON.stringify({ name: 'bacon_eggs2/3', length: 1_200_000 }))
	localStorage.setItem('*ITEM*bacon_eggs3/3', JSON.stringify({ name: 'bacon_eggs3/3', length: 1_200_000 }))
	localStorage.setItem(
		'*LIBRARY*',
		JSON.stringify(['bacon_eggs', 'bacon_eggs1/3', 'bacon_eggs2/3', 'bacon_eggs3/3', 'composite'])
	)
}
