// This is where all the colors are declared
// Green
const GREENISH = 'rgb(97, 226, 148)'
// const GREENISH_DARKER = "rgb(28, 155, 79)"
// // Red/Orange
// const RED_ORANGE = {
// 	backgroundColor: "rgb(255, 133, 82)",
// }
// Light blue
const LIGHT_BLUE = 'rgb(191, 219, 247)'
// const LIGHT_BLUE_DARKER = "rgb(64, 147, 255)"
// Graylike
export const GRAYLIKE = {
	backgroundColor: 'rgb(36, 123, 160)',
}
// Deep blue
export const DEEP_BLUE = {
	backgroundColor: 'rgb(9, 12, 155)',
}

export const SHARED = {
	backgroundColor: LIGHT_BLUE,
	border: `2px solid black`,
	borderRadius: '10px',
}

export const STRUCTURE = {
	backgroundColor: GREENISH,
	border: `2px solid black`,
	borderRadius: '5px',
	padding: '5px',
}

export const cssHelper = {
	boxSizing: 'border-box',

	padding: '10px',
	display: 'grid',
	gap: '10px',

	width: '100%',
	overflowX: 'clip',

	height: '100%',
	overflowY: 'clip',

	backgroundColor: 'lightblue',

	// Aesthetics
	border: '1px solid black',
	cursor: 'default',
	userSelect: 'none',
}
