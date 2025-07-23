import { Input } from "@mui/material";

interface ItemListFilterProps {
  readonly value: string;
  readonly setValue: (value: string) => void;
}

export default function ItemListFilter({ value, setValue }: ItemListFilterProps) {

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