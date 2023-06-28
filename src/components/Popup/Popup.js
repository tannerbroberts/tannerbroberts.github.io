import React from 'react'
import { useGlobalContext } from '../../App'
import { cssHelper } from '../../api/cssHelper'
import PopupHeader from './PopupHeader'

const popupCSS = (visible) => {
	const obj = {
		...cssHelper,
		fontSize: '32',
		position: 'absolute',
		left: '12vw',
		top: '12vh',
		width: '76vw',
		height: '76vh',
		overflowY: 'scroll',
	}
	if (!visible) obj.display = 'none'

	return obj
}

export default function Popup({ children }) {
	const { popupOpen } = useGlobalContext()

	return (
		<div style={popupCSS(popupOpen)}>
			<PopupHeader />
			{children}
			<img src={'https://pbs.twimg.com/profile_images/742877069793742848/c0Ec2mTU_normal.jpg'} alt='testing' />
		</div>
	)
}
