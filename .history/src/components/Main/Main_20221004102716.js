import React from "react"
import { cssHelper } from "../../api/cssHelper"

const MainCSS = {
	...cssHelper,
}

export default function Main() {
	return <div style={MainCSS} />
}
