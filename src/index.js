import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

document.getElementsByTagName('body')[0].style.width = '100%'
document.getElementsByTagName('body')[0].style.margin = 0
document.getElementsByTagName('body')[0].style.padding = 0
document.getElementsByTagName('body')[0].style.height = '100vh'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
