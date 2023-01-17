import React from "react"
import { Button } from "@mui/material"
import { useGlobalContext } from "../../../../../GlobalContext"
import { cssHelper } from "../../../../../api/cssHelper"

const addItemCSS = () => {
	const obj = {
		...cssHelper,
        backgroundColor: "lightblue",
		color: "black",
	}

	return obj
}

export default function AddItem() {
	const { selectedItemName, addItem } = useGlobalContext()
	console.log("Name:", selectedItemName)

    return (
        <Button style={addItemCSS()} variant="contained" onClick={addItem} >
            Add Item
        </Button>
    )
}
