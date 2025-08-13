import { Menu, MenuOpen, AccountBalance, PlayArrow, CalendarToday } from '@mui/icons-material';
import { AppBar, Button, ButtonGroup, IconButton, Toolbar, Typography, Avatar, Tooltip } from '@mui/material';
import { useMemo, useCallback, useState } from 'react';
import { useAppDispatch, useAppState } from '../reducerContexts';
import { getItemById } from '../functions/utils/item/index';
import StorageManagementButton from './StorageManagementButton';
import { useAuth } from '../auth/useAuth';
import LoginDialog from './LoginDialog';

export default function Header() {
  const { user, logout } = useAuth()
  const { sideDrawerOpen, items, focusedItemId, currentView } = useAppState()
  const appDispatch = useAppDispatch()
  const [loginOpen, setLoginOpen] = useState(false)

  const focusedItem = useMemo(() => {
    return getItemById(items, focusedItemId)
  }, [focusedItemId, items])

  const handleClose = useCallback(() => {
    appDispatch({
      type: "SET_FOCUSED_ITEM_BY_ID",
      payload: { focusedItemId: null },
    });
  }, [appDispatch]);

  const handleViewChange = useCallback((view: 'execution' | 'accounting' | 'day') => {
    appDispatch({
      type: "SET_CURRENT_VIEW",
      payload: { currentView: view },
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
          {!focusedItem && (
            <ButtonGroup variant="contained" size="small" sx={{ mr: 2 }}>
              <Button
                onClick={() => handleViewChange('execution')}
                variant={currentView === 'execution' ? 'contained' : 'outlined'}
                startIcon={<PlayArrow />}
                sx={{
                  color: currentView === 'execution' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'white',
                  backgroundColor: currentView === 'execution' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Execution
              </Button>
              <Button
                onClick={() => handleViewChange('day')}
                variant={currentView === 'day' ? 'contained' : 'outlined'}
                startIcon={<CalendarToday />}
                sx={{
                  color: currentView === 'day' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'white',
                  backgroundColor: currentView === 'day' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Day
              </Button>
              <Button
                onClick={() => handleViewChange('accounting')}
                variant={currentView === 'accounting' ? 'contained' : 'outlined'}
                startIcon={<AccountBalance />}
                sx={{
                  color: currentView === 'accounting' ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'white',
                  backgroundColor: currentView === 'accounting' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Accounting
              </Button>
            </ButtonGroup>
          )}
          <StorageManagementButton />
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tooltip title={user.email || user.id}>
                <Avatar sx={{ width: 28, height: 28 }}>
                  {(user.email || user.id).slice(0, 1).toUpperCase()}
                </Avatar>
              </Tooltip>
              <Button variant="outlined" size="small" onClick={logout} sx={{ color: 'white', borderColor: 'white' }}>Logout</Button>
            </div>
          ) : (
            <Button variant="outlined" size="small" onClick={() => setLoginOpen(true)} sx={{ color: 'white', borderColor: 'white' }}>Login</Button>
          )}
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
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </Toolbar>
    </AppBar>
  )
}
