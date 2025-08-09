import { IconButton, Tooltip } from '@mui/material';
import { Shuffle } from '@mui/icons-material';
import { useCallback } from 'react';
import { useAppDispatch, useAppState } from '../reducerContexts';

export default function RandomItemButton() {
  const { items } = useAppState();
  const appDispatch = useAppDispatch();

  const handleRandomItem = useCallback(() => {
    if (items.length === 0) return;

    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];

    appDispatch({
      type: 'SET_FOCUSED_ITEM_BY_ID',
      payload: { focusedItemId: randomItem.id }
    });
  }, [items, appDispatch]);

  return (
    <Tooltip title="Select Random Item">
      <IconButton
        onClick={handleRandomItem}
        disabled={items.length === 0}
      >
        <Shuffle />
      </IconButton>
    </Tooltip>
  );
}
