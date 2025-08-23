import { Menu, MenuOpen, AccountBalance, PlayArrow, CalendarToday } from '@mui/icons-material';
import { AppBar, Button, ButtonGroup, IconButton, Toolbar, Typography, Avatar, Tooltip } from '@mui/material';
import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppState } from '../reducerContexts';
import { getItemById } from '../functions/utils/item/index';
import StorageManagementButton from './StorageManagementButton';
// Auth removed – single implicit dev user.

export default function Header() {
  const { sideDrawerOpen, items, focusedItemId, currentView } = useAppState()
  const appDispatch = useAppDispatch()

  const focusedItem = useMemo(() => getItemById(items, focusedItemId), [focusedItemId, items])

  const handleClose = useCallback(() => {
    appDispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: null } })
  }, [appDispatch])

  const handleViewChange = useCallback((view: 'execution' | 'accounting' | 'day') => {
    appDispatch({ type: 'SET_CURRENT_VIEW', payload: { currentView: view } })
  }, [appDispatch])

  return (
  <AppBar position="static" sx={{ maxHeight: '100vh', overflowY: 'hidden' }}>
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
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Close
            </Button>
          )}
        </Typography>
  <div style={{ display: 'flex', gap: 0, alignItems: 'center', marginLeft: 0, padding: 0 }}>
          {!focusedItem && (
            <ButtonGroup variant="contained" size="small" sx={{ mr: 2 }}>
              <Button
                onClick={() => handleViewChange('execution')}
                variant={currentView === 'execution' ? 'contained' : 'outlined'}
                startIcon={<PlayArrow />}
                sx={{
                  color: currentView === 'execution' ? 'white' : 'rgba(255,255,255,0.8)',
                  borderColor: 'white',
                  backgroundColor: currentView === 'execution' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Execution
              </Button>
              <Button
                onClick={() => handleViewChange('day')}
                variant={currentView === 'day' ? 'contained' : 'outlined'}
                startIcon={<CalendarToday />}
                sx={{
                  color: currentView === 'day' ? 'white' : 'rgba(255,255,255,0.8)',
                  borderColor: 'white',
                  backgroundColor: currentView === 'day' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Day
              </Button>
              <Button
                onClick={() => handleViewChange('accounting')}
                variant={currentView === 'accounting' ? 'contained' : 'outlined'}
                startIcon={<AccountBalance />}
                sx={{
                  color: currentView === 'accounting' ? 'white' : 'rgba(255,255,255,0.8)',
                  borderColor: 'white',
                  backgroundColor: currentView === 'accounting' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Accounting
              </Button>
            </ButtonGroup>
          )}
          <StorageManagementButton />
          <Tooltip title={'dev-user'}>
            <Avatar sx={{ width: 28, height: 28, maxWidth: '100vw' }}>D</Avatar>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  )
}
