import * as React from 'react'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useGlobalContext } from '../App'

const buttonCSS = {
	position: 'absolute',
	right: '5vw',
	bottom: '5vh',
}

export default function FloatingActionButtonWrapper() {
	const { shelfOpen, setShelfOpen } = useGlobalContext()
	return (
		<div style={buttonCSS}>
			<Box sx={{ '& > :not(style)': { m: 1 } }}>
				<Fab color='secondary' aria-label='add' onClick={() => setShelfOpen(!shelfOpen)}>
					{shelfOpen ? <RemoveIcon /> : <AddIcon />}
				</Fab>
			</Box>
		</div>
	)
}
