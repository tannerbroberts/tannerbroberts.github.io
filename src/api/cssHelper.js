// This is where all the colors are declared
// Green
const GREENISH = "rgb(97, 226, 148)"
const GREENISH_DARKER = "rgb(28, 155, 79)"
// Red/Orange
const RED_ORANGE = {
	backgroundColor: "rgb(255, 133, 82)",
}
// Light blue
const LIGHT_BLUE = "rgb(191, 219, 247)"
const LIGHT_BLUE_DARKER = "rgb(64, 147, 255)"
// Graylike
export const GRAYLIKE = {
	backgroundColor: "rgb(36, 123, 160)",
}
// Deep blue
export const DEEP_BLUE = {
	backgroundColor: "rgb(9, 12, 155)",
}

export const SHARED = {
	backgroundColor: LIGHT_BLUE,
	border: `2px solid ${LIGHT_BLUE_DARKER}`,
	borderRadius: "10px",
}

export const STRUCTURE = {
	backgroundColor: GREENISH,
	border: `2px solid ${GREENISH_DARKER}`,
	borderRadius: "5px",
	padding: "5px",
}

export const INPUT = {
	backgroundColor: RED_ORANGE,
	border: `2px solid ${GREENISH_DARKER}`,
	borderRadius: "5px",
	padding: "5px",
}

export const cssHelper = {
	boxSizing: "border-box",

	// These two make each is a nice child of grid
	width: "100%",

	// These two make each is a grid and spaces chidlren
	padding: "10px",
	gap: "10px",
	display: "grid",

	// Grid layout of children
	// gridTemplateRows / gridTemplateColumns
	gridTemplateColumns: "1fr",
	gridTemplateRows: "min-content",
	alignItems: "start",

	// Aesthetics
	border: "1px solid black",
	cursor: "default",
	userSelect: "none",
	backgroundColor: "white",
}

export const MOBILE_BREAKPOINT = 570