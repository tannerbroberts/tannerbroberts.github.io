import { useAppState } from "../context/App"
import { getItemById } from "../store/utils/item"

export default function LedgerLines() {
  const { focusedItemId, items } = useAppState()

  const focusedItem = getItemById(items, focusedItemId)

  console.log('focusedItem', focusedItem)
  return ("ledger lines")
}
