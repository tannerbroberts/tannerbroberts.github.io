const DELIMITER = "*"
const LIBRARY = `${DELIMITER}LIBRARY${DELIMITER}`
const VARIABLE_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`
const ITEM_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`

const hasIllegalName = (objectWithNameProperty) => {
	return objectWithNameProperty.name.includes(DELIMITER)
}

export const getLibrary = () => {
	const library = localStorage.getItem(LIBRARY)
	if (library) return JSON.parse(library)
	return []
}

export const saveLibrary = (libraryItemNameArray) => {
	localStorage.setItem(LIBRARY, JSON.stringify(libraryItemNameArray))
}

export const getItem = (name) => {
	const item = localStorage.getItem(`${ITEM_NAME_SPACE}${name}`)
	if (item) return JSON.parse(item)
	return {}
}

export const saveItem = (itemObject) => {
	if (hasIllegalName(itemObject)) return false
	localStorage.setItem(
		`${ITEM_NAME_SPACE}${itemObject.name}`,
		JSON.stringify(itemObject)
	)
}

export const deleteItem = (name) => {
	localStorage.removeItem(`${ITEM_NAME_SPACE}${name}`)
}

export const getVariable = (name) => {
	const item = localStorage.getItem(`${VARIABLE_NAME_SPACE}${name}`)
	if (item) return JSON.parse(item)
	return {}
}

export const saveVariable = (variableObject) => {
	if (hasIllegalName(variableObject)) return false
	localStorage.setItem(
		`${VARIABLE_NAME_SPACE}${JSON.stringify(variableObject)}`
	)
}

export const deleteVariable = (name) => {
	localStorage.removeItem(`${VARIABLE_NAME_SPACE}${name}`)
}
