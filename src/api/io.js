/* eslint-disable no-unused-vars */
const DELIMITER = "*"
const LIBRARY = `${DELIMITER}LIBRARY${DELIMITER}`
const VARIABLE_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`
const ITEM_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`

/*
 __________   ___ .______     ______   .______     .___________. _______  _______  
|   ____\  \ /  / |   _  \   /  __  \  |   _  \    |           ||   ____||       \ 
|  |__   \  V  /  |  |_)  | |  |  |  | |  |_)  |   `---|  |----`|  |__   |  .--.  |
|   __|   >   <   |   ___/  |  |  |  | |      /        |  |     |   __|  |  |  |  |
|  |____ /  .  \  |  |      |  `--'  | |  |\  \----.   |  |     |  |____ |  '--'  |
|_______/__/ \__\ | _|       \______/  | _| `._____|   |__|     |_______||_______/ 
*/

export const addItem = (itemObject) => {
	console.log("Adding Item")
	console.log("If check:", !objectHasIllegalName(itemObject))
	if (!objectHasIllegalName(itemObject)) {
		const library = getLibrary()
		saveItem(itemObject)
		console.log("Library mid addition:", library)
		saveLibrary({ ...library, itemObject })
	}
}

export const isIllegalString = (nameString) => {
	if (nameString) {
		return nameString.includes(DELIMITER)
	} else return true
}

/**
 __    __   _______  __      .______    _______ .______          _______.
|  |  |  | |   ____||  |     |   _  \  |   ____||   _  \        /       |
|  |__|  | |  |__   |  |     |  |_)  | |  |__   |  |_)  |      |   (----`
|   __   | |   __|  |  |     |   ___/  |   __|  |      /        \   \    
|  |  |  | |  |____ |  `----.|  |      |  |____ |  |\  \----.----)   |   
|__|  |__| |_______||_______|| _|      |_______|| _| `._____|_______/    
 */

const objectHasIllegalName = (objectWithNameProperty) => {
	console.log("object:", objectWithNameProperty)
	console.log(
		"illegal object if check:",
		objectWithNameProperty?.name
	)
	if (objectWithNameProperty?.name)
		return isIllegalString(objectWithNameProperty?.name)
	else return true
}

const getLibrary = () => {
	const library = localStorage.getItem(LIBRARY)
	if (library) return JSON.parse(library)
	return []
}

const saveLibrary = (libraryItemNameArray) => {
	localStorage.setItem(LIBRARY, JSON.stringify(libraryItemNameArray))
}

const getItem = (name) => {
	const item = localStorage.getItem(`${ITEM_NAME_SPACE}${name}`)
	if (item) return JSON.parse(item)
	return {}
}

const saveItem = (itemObject) => {
	if (objectHasIllegalName(itemObject)) return false
	localStorage.setItem(
		`${ITEM_NAME_SPACE}${itemObject.name}`,
		JSON.stringify(itemObject)
	)
}

const deleteItem = (name) => {
	localStorage.removeItem(`${ITEM_NAME_SPACE}${name}`)
}

const getVariable = (name) => {
	const item = localStorage.getItem(`${VARIABLE_NAME_SPACE}${name}`)
	if (item) return JSON.parse(item)
	return {}
}

const saveVariable = (variableObject) => {
	if (objectHasIllegalName(variableObject)) return false
	localStorage.setItem(
		`${VARIABLE_NAME_SPACE}${JSON.stringify(variableObject)}`
	)
}

const deleteVariable = (name) => {
	localStorage.removeItem(`${VARIABLE_NAME_SPACE}${name}`)
}
