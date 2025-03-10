import { Input } from "@mui/material";


export default function ItemListFilter({ value, setValue }: { value: string, setValue: (value: string) => void }) {

  return (
    <Input
      placeholder="Filter items"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      sx={{
        margin: '10px',
        width: '90%',
        backgroundColor: 'white',
        borderRadius: '5px',
        padding: '5px'
      }}
      inputProps={{
        'aria-label': 'Filter items',
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    />
  )
}