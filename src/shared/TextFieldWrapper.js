import React from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"

export default function BasicTextFields({
	label,
	type = "standard",
	value = "",
	setValue = () => {},
}) {
	return (
		<Box
			component='form'
			sx={{
				"& > :not(style)": { m: 1, width: "25ch" },
			}}
			noValidate
			autoComplete='off'
		>
			<TextField
				id='standard-basic'
				label={label}
				variant={type} // Or: standard, filled
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
		</Box>
	)
}
