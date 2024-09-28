import React from 'react';
import BottomDrawerProvider from './Provider_BottomDrawer';
import BottomDrawerReducer, { BottomDrawerInitialState } from './Reducer_BottomDrawer';
import { Button, Popover } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';

export default function BottomDrawer() {
  const [state, dispatch] = React.useReducer(BottomDrawerReducer, BottomDrawerInitialState);
  const { AboutTimeState, AboutTimeDispatch } = useAboutTimeContext();

  const closeBottomDrawer = React.useCallback(() => {
    AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
  }, [AboutTimeDispatch]);

  console.log('anchor', AboutTimeState.BottomDrawerAnchorEl);

  return (
    <BottomDrawerProvider {...{ state, dispatch }}>
      <Popover
        id={'bottom-drawer-popover'}
        open={AboutTimeState.bottomDrawerOpen}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        <Button onClick={closeBottomDrawer}>Close</Button>
      </Popover>
    </BottomDrawerProvider>
  );
}
