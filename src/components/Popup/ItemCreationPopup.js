import React from "react"
import TextFieldWrapper from "../../shared/TextFieldWrapper"
import TimeLengthPicker from "../../shared/TimeLengthPicker"

export default function ItemCreationPopup() {
	return (
		<>
			<TextFieldWrapper label='Item Name' />
			<TimeLengthPicker />
		</>
	)
}
