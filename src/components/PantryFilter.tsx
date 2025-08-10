import { useCallback, useMemo, useState } from 'react'
import { Box, Button, Chip, Divider, Stack, TextField, Typography } from '@mui/material'
import { useAppState } from '../reducerContexts'
import { filterMakeableItems, Pantry } from '../utils/pantry'

export default function PantryFilter({ onFiltered }: Readonly<{ onFiltered: (ids: string[] | null) => void }>) {
  const { items } = useAppState()
  const [pantry, setPantry] = useState<Pantry>({})
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')

  const makeableIds = useMemo(() => {
    return filterMakeableItems(items, pantry).map(i => i.id)
  }, [items, pantry])

  const addVar = useCallback(() => {
    const k = key.trim()
    const n = Number(val)
    if (!k || !Number.isFinite(n) || n < 0) return
    setPantry(p => ({ ...p, [k]: n }))
    setKey(''); setVal('')
  }, [key, val])

  const removeVar = useCallback((k: string) => {
    setPantry(p => {
      const newState = { ...p }
      delete newState[k]
      return newState
    })
  }, [])

  const apply = useCallback(() => {
    onFiltered(makeableIds)
  }, [onFiltered, makeableIds])

  const clear = useCallback(() => {
    onFiltered(null)
  }, [onFiltered])

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>What can I make?</Typography>
      <Stack direction="row" spacing={1}>
        <TextField label="Variable" size="small" value={key} onChange={e => setKey(e.target.value)} sx={{ flex: 1 }} />
        <TextField label="Qty" size="small" value={val} onChange={e => setVal(e.target.value)} sx={{ width: 90 }} />
        <Button variant="outlined" onClick={addVar}>Add</Button>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
        {Object.entries(pantry).map(([k, v]) => (
          <Chip key={k} label={`${k}: ${v}`} onDelete={() => removeVar(k)} />
        ))}
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={apply} disabled={makeableIds.length === 0}>Filter ({makeableIds.length})</Button>
        <Button onClick={clear}>Clear</Button>
      </Stack>
    </Box>
  )
}
