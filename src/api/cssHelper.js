// A pallet of colors
export const COLORS = {
	ORANGE: 'rgb(184, 12, 9',
	THISTLE: 'rgb(207, 179, 205)',
	SKY: 'rgb(86, 203, 249)',
	GREEN: 'rgb(196, 247, 161)',
	CHARCOAL: 'rgb(47, 62, 70)',
}

export const SHARED = {
	backgroundColor: COLORS.SKY,
	border: `2px solid black`,
	borderRadius: '10px',
}

export const STRUCTURE = {
	backgroundColor: 	COLORS.GREENISH,
	border: `2px solid black`,
	borderRadius: '5px',
	padding: '10px',
}

export const ROW = {
	justifyContent: 'center',
	alignItems: 'center',
	height: 'max(50px, 10vh)',
	textAlign: 'center',
	fontSize: 'min(3vw, 30px)',
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

	backgroundColor: 'lightyellow',

	// Aesthetics
	border: '1px solid black',
	cursor: 'default',
	userSelect: 'none',
	fontFamily: 'monospace',
}
