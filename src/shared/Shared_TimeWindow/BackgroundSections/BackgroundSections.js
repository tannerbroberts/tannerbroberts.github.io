import React from "react"
import BackgroundSection from "./BackgroundSection"

export default function BackgroundSections({ sectionCount }) {
	const sections = []
	for (let i = 0; i < sectionCount; i++) {
		sections.push(<BackgroundSection key={i} position={i} />)
	}
	return sections
}
