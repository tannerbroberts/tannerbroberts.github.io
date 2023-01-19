import React from "react"
import { useGlobalContext } from "../../../App"
import BackgroundSection from "./BackgroundSection"

export default function BackgroundSections({ length }) {
	const sections = []
	const { scale } = useGlobalContext()
	for (let i = 0; i < length; i += scale) {
		sections.push(<BackgroundSection key={i} index={i / scale} />)
	}
	return sections
}
