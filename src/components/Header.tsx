import { Menu, MenuOpen } from '@mui/icons-material';
import { AppBar, Button, ButtonGroup, IconButton, Toolbar, Typography } from '@mui/material';
import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppState } from '../reducerContexts/App';
import { getItemById } from '../functions/utils/item';

export default function Header() {
  const { sideDrawerOpen, items, focusedItemId } = useAppState()
  const appDispatch = useAppDispatch()

  const focusedItem = useMemo(() => {
    return getItemById(items, focusedItemId)
  }, [focusedItemId, items])

  const handleClose = useCallback(() => {
    appDispatch({
      type: "SET_FOCUSED_ITEM_BY_ID",
      payload: { focusedItemId: null },
    });
  }, [appDispatch]);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          onClick={() => appDispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: !sideDrawerOpen } })}
          color="inherit"
          aria-label="open drawer"
          edge="start"
        >
          {sideDrawerOpen ? <MenuOpen /> : <Menu />}
        </IconButton>
        <Typography variant="h4" noWrap component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {focusedItem ? focusedItem.name : 'ATP'}
          {focusedItem && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClose}
              sx={{
                minWidth: '60px',
                height: '32px',
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Close
            </Button>
          )}
        </Typography>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: 'auto' }}>
          <ButtonGroup variant="contained" size="small">
            <Button onClick={() => appDispatch({
              type: "SET_MILLISECONDS_PER_SEGMENT",
              payload: { millisecondsPerSegment: 1000 }
            })}>Second</Button>
            <Button onClick={() => appDispatch({
              type: "SET_MILLISECONDS_PER_SEGMENT",
              payload: { millisecondsPerSegment: 60000 }
            })}>Minute</Button>
            <Button onClick={() => appDispatch({
              type: "SET_MILLISECONDS_PER_SEGMENT",
              payload: { millisecondsPerSegment: 3600000 }
            })}>Hour</Button>
            <Button onClick={() => appDispatch({
              type: "SET_MILLISECONDS_PER_SEGMENT",
              payload: { millisecondsPerSegment: 86400000 }
            })}>Day</Button>
            <Button onClick={() => appDispatch({
              type: "SET_MILLISECONDS_PER_SEGMENT",
              payload: { millisecondsPerSegment: 604800000 }
            })}>Week</Button>
          </ButtonGroup>
        </div>
      </Toolbar>
    </AppBar>
  )
}
