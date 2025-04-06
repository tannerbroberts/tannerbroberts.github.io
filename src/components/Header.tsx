import { Menu, MenuOpen } from '@mui/icons-material';
import { AppBar, Button, ButtonGroup, IconButton, Slider, Toolbar, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useAppDispatch, useAppState } from '../reducerContexts/App';
import { getItemById } from '../functions/utils/item';

export default function Header() {
  const { sideDrawerOpen, items, focusedItemId } = useAppState()
  const appDispatch = useAppDispatch()

  const focusedItem = useMemo(() => {
    return getItemById(items, focusedItemId)
  }, [focusedItemId, items])

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
        <Typography variant="h4" noWrap component="div">
          {focusedItem ? focusedItem.name : 'About Time'}
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
          <Slider
            size="small"
            defaultValue={40}
            min={10}
            max={300}
            valueLabelDisplay="auto"
            onChange={(_, value) => {
              appDispatch({ type: "SET_PIXELS_PER_SEGMENT", payload: { pixelsPerSegment: value as number } });
            }}
            sx={{
              width: '200px',
              color: 'white',
              '& .MuiSlider-valueLabel': {
                backgroundColor: 'white',
                color: 'black',
              }
            }}
          />
        </div>
      </Toolbar>
    </AppBar>
  )
}
