const DELIMITER = "*"
const LIBRARY = `${DELIMITER}LIBRARY${DELIMITER}`
const VARIABLE_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`
const ITEM_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`

const hasIllegalName = (objectWithNameProperty) => {
	return objectWithNameProperty.name.contains(DELIMITER)
}

export const getLibrary = () => {
	const library = localStorage.getItem(`${DELIMITER}${LIBRARY}`)
	if(library) return library
	return []
}

export const saveLibrary = (libraryItemNameArray) => {
	localStorage.setItem(`${LIBRARY}`, libraryItemNameArray)
}

export const getItem = (name) => {
    const item = localStorage.getItem(`${ITEM_NAME_SPACE}${name}`)
    if(item) return item
    return {}
}

export const saveItem = (itemObject) => {
	if (hasIllegalName(itemObject)) return false
	localStorage.setItem(`${ITEM_NAME_SPACE}${itemObject.name}`)
}

export const deleteItem = (itemObject) => {
	localStorage.removeItem(itemObject.name)
}

export const getVariable = (name) => {
    const item = localStorage.getItem(`${VARIABLE_NAME_SPACE}${name}`)
    if(item) return item
    return {}
}

export const saveVariable = (variableObject) => {
	if (hasIllegalName(variableObject)) return false
	localStorage.setItem(`${VARIABLE_NAME_SPACE}${variableObject.name}`)
}

export const deleteVariable = (itemObject) => {
	localStorage.removeItem(itemObject.name)
}
