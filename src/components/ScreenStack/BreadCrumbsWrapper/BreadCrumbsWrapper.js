import * as React from "react"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Link from "@mui/material/Link"
import HomeIcon from "@mui/icons-material/Home"
import { useGlobalContext } from "../../../GlobalContext"

const popFramesUsage = (index, array, popFrames) => {
	const popCount = Math.max(0, array.length - index - 1)
	console.log(
		"Length: ",
		array.length,
		"Index: ",
		index,
		"popCount: ",
		popCount
	)
	popFrames(popCount)
}

export default function BreadCrumbsWrapper({ objects }) {
	const { popFrames } = useGlobalContext()

	return (
		<Breadcrumbs aria-label='breadcrumb'>
			{objects?.map((object, index, array) => {
				if (object.path === "calendar")
					return (
						<Link
							key={Math.random()}
							underline='hover'
							sx={{ display: "flex", alignItems: "center" }}
							color='inherit'
							onClick={() => popFramesUsage(index, array, popFrames)}
						>
							<HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
							Calendar
						</Link>
					)
				else if (object.path === "accounting")
					return (
						<Link
							key={Math.random()}
							underline='hover'
							sx={{ display: "flex", alignItems: "center" }}
							color='inherit'
							onClick={() => popFramesUsage(index, array, popFrames)}
						>
							<HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
							Accounting
						</Link>
					)
				else
					return (
						<Link
							key={Math.random()}
							underline='hover'
							sx={{ display: "flex", alignItems: "center" }}
							color='inherit'
							onClick={() => popFramesUsage(index, array, popFrames)}
						>
							<HomeIcon sx={{ mr: 0.5 }} fontSize='inherit' />
							{object?.name}
						</Link>
					)
			})}
		</Breadcrumbs>
	)
}
