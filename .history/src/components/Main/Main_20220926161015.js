import React from "react"
import { cssHelper } from "../../api/cssHelper"

const MainCSS = {
	...cssHelper,
	width: "100%",
}

export default function Main() {
	return <div style={MainCSS} />
}
