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

export const isIllegalString = (nameString) => {
	const library = getLibrary()
	if (nameString) {
		return (
			nameString.includes(DELIMITER) || library.includes(nameString)
		)
	} else return true
}

export const postItem = (itemObject) => {
	if (!objectHasIllegalName(itemObject)) {
		saveItem(itemObject)
		return true
	}
	return false
}

export const getItem = (name) => {
	console.log("getting item: ", name)
	const item = JSON.parse(
		localStorage.getItem(`${ITEM_NAME_SPACE}${name}`)
	)
	if (item) return item
	return undefined
}

export const deleteItem = (name) => {
	// Remove from LS
	localStorage.removeItem(`${ITEM_NAME_SPACE}${name}`)
	// Remove from Library
	saveLibrary(getLibrary().filter((itemName) => itemName !== name))
}

export const getLibrary = () => {
	const library = JSON.parse(localStorage.getItem(LIBRARY))
	if (library) return library
	return ["*"]
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
	if (objectWithNameProperty?.name)
		return isIllegalString(objectWithNameProperty?.name)
	else return true
}

const saveLibrary = (libraryItemNameArray) => {
	localStorage.setItem(LIBRARY, JSON.stringify(libraryItemNameArray))
}

const saveItem = (itemObject) => {
	localStorage.setItem(
		`${ITEM_NAME_SPACE}${itemObject.name}`,
		JSON.stringify(itemObject)
	)
	saveLibrary([...getLibrary(), itemObject.name])
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
