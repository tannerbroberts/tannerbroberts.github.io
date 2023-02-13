/* eslint-disable no-unused-vars */
const DELIMITER = '*'
const LIBRARY = `${DELIMITER}LIBRARY${DELIMITER}`
const VARIABLE_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`
const ITEM_NAME_SPACE = `${DELIMITER}ITEM${DELIMITER}`
const STATE_NAME_SPACE = `${DELIMITER}STATE${DELIMITER}`

/*
 __________   ___ .______     ______   .______     .___________. _______  _______  
|   ____\  \ /  / |   _  \   /  __  \  |   _  \    |           ||   ____||       \ 
|  |__   \  V  /  |  |_)  | |  |  |  | |  |_)  |   `---|  |----`|  |__   |  .--.  |
|   __|   >   <   |   ___/  |  |  |  | |      /        |  |     |   __|  |  |  |  |
|  |____ /  .  \  |  |      |  `--'  | |  |\  \----.   |  |     |  |____ |  '--'  |
|_______/__/ \__\ | _|       \______/  | _| `._____|   |__|     |_______||_______/ 
*/

export const isIllegalString = (nameString) => {
	try {
		const library = getLibrary()
		if (nameString) {
			return nameString.includes(DELIMITER) || library.includes(nameString)
		} else return true
	} catch (err) {
		console.log('ERROR: in f() isIllegalString:', err)
	}
	return true
}

export const postItem = (itemObject) => {
	if (!objectHasIllegalName(itemObject)) {
		saveItem(itemObject)
		return true
	}
	return false
}

export const postChildPositionChange = (itemObject) => {
	console.log('here')
	if (valid(itemObject)) saveItem(itemObject, false)
	return true
}

export const postChildRemove = (itemObject) => {
	console.log('here now')
	if (valid(itemObject)) saveItem(itemObject, false)
	return true
}

export const getItem = (name) => {
	const item = JSON.parse(localStorage.getItem(`${ITEM_NAME_SPACE}${name}`))
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
	return ['*']
}

export const saveState = (stateName, stateValue) => {
	localStorage.setItem(`${STATE_NAME_SPACE}${stateName}`, JSON.stringify(stateValue))
}

export const loadState = (stateName) => {
	try {
		const savedValue = localStorage.getItem(`${STATE_NAME_SPACE}${stateName}`)
		if (savedValue) {
			return JSON.parse(savedValue)
		}
		return null
	} catch (err) {
		console.log('ERROR in f() loadState:', err)
	}
	return null
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
	if (objectWithNameProperty?.name) return isIllegalString(objectWithNameProperty?.name)
	else return true
}

const saveLibrary = (libraryItemNameArray) => {
	localStorage.setItem(LIBRARY, JSON.stringify(libraryItemNameArray))
}

const saveItem = (itemObject, addToLibrary = true) => {
	localStorage.setItem(`${ITEM_NAME_SPACE}${itemObject.name}`, JSON.stringify(itemObject))
	if (addToLibrary) saveLibrary([...getLibrary(), itemObject.name])
}

const getVariable = (name) => {
	const item = localStorage.getItem(`${VARIABLE_NAME_SPACE}${name}`)
	if (item) return JSON.parse(item)
	return {}
}

const saveVariable = (variableObject) => {
	if (objectHasIllegalName(variableObject)) return false
	localStorage.setItem(`${VARIABLE_NAME_SPACE}${JSON.stringify(variableObject)}`)
}

const deleteVariable = (name) => {
	localStorage.removeItem(`${VARIABLE_NAME_SPACE}${name}`)
}

const match = (a, b) => {
	try {
		return valid(a) && valid(b) && a.name === b.name && a.lengh === b.length
	} catch (err) {
		console.log('ERROR: in f() match:', err)
	}
	return false
}

const valid = (obj) => {
	try {
		return obj.name && obj.length
	} catch (err) {
		console.log('ERROR: in f() valid:', err)
	}
}
