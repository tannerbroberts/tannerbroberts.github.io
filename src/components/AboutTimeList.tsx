import { useAppState } from "../context/App"
import AboutTimeListItem from "./AboutTimeListItem.tsx"

export default function AboutTimeList() {
  const { items } = useAppState()

  return (
    <>
      {items.map(item => <AboutTimeListItem key={item.id} item={item} />)}
    </>
  )
}