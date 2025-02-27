import { useMemo } from "react"
import { useAppState } from "../context/App"
import AboutTimeListItem from "./AboutTimeListItem.tsx"

export default function AboutTimeList() {
  const { items } = useAppState()
  const sortedByDurationItems = useMemo(() => [...items].sort((a, b) => a.duration - b.duration), [items])

  return (
    <>
      {sortedByDurationItems.map(item => <AboutTimeListItem key={item.id} item={item} />)}
    </>
  )
}