import React, { useState } from "react"
import ButtonWrapper from "../../shared/ButtonWrapper"
import TextFieldWrapper from "../../shared/TextFieldWrapper"
import TimeLengthPicker from "../../shared/TimeLengthPicker"

export default function ItemCreationPopup() {
	const [name, setName] = useState()
	return (
		<>
			<TextFieldWrapper
				label='Item Name'
				value={name}
				setValue={setName}
			/>
			<TimeLengthPicker />
			<ButtonWrapper label='Create' />
		</>
	)
}
