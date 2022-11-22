
// This is where all the colors are declared
// Green
export const color1 = "rgb(97, 226, 148)"
export const color1_darker = "rgb(28, 155, 79)"
// Red/Orange
export const color2 = {
	backgroundColor: "rgb(255, 133, 82)",
}
// Light blue
export const color3 = "rgb(191, 219, 247)"
export const color3_darker = "rgb(64, 147, 255)"
// Graylike
export const color4 = {
	backgroundColor: "rgb(36, 123, 160)",
}
// Deep blue
export const color5 = {
	backgroundColor: "rgb(9, 12, 155)",
}

export const cssHelper = {
	boxSizing: "border-box",

	// These two make each is a nice child of grid
	height: "100%",
	width: "100%",

	// These two make each is a grid and spaces chidlren
	margin: "auto",
	padding: "10px",
	gap: "10px",
	display: "grid",

	// Grid layout of children
	// gridTemplateRows / gridTemplateColumns
	gridTemplate: "1fr / 1fr",
	gridTemplateRows: "min-content",
	alignContent: "start",

	// Aesthetics
	// border: "2px solid rgb(69, 69, 69)",
	cursor: "default",
	userSelect: "none",
	backgroundColor: "white",
}

export const SHARED = {
	backgroundColor: color3,
	border: `2px solid ${color3_darker}`,
	borderRadius: '10px',
}

export const STRUCTURE = {
	backgroundColor: color1,
	border: `2px solid ${color1_darker}`,
	borderRadius: '5px',
	padding: '5px',
}