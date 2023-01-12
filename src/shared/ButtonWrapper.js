import * as React from "react"
import Button from "@mui/material/Button"

export default function ButtonWrapper({ label, onClick, type }) {
	// type: text, contained, outlined
	return (
		<Button onClick={onClick} variant={type}>
			{label}
		</Button>
	)
}
