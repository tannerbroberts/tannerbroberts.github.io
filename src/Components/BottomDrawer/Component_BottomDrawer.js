import React from 'react';
import BottomDrawerProvider from './Provider_BottomDrawer';
import BottomDrawerReducer, { BottomDrawerInitialState } from './Reducer_BottomDrawer';
import { Button, Input, Popover } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';

export default function BottomDrawer() {
  const [state, dispatch] = React.useReducer(BottomDrawerReducer, BottomDrawerInitialState);
  const { AboutTimeState, AboutTimeDispatch } = useAboutTimeContext();

  return (
    <BottomDrawerProvider {...{ state, dispatch }}>
      <Popover
        id={'bottom-drawer-popover'}
        disableRestoreFocus
        open={AboutTimeState.bottomDrawerOpen}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        {AboutTimeState.bottomDrawerOpen &&
          <>
            <Input autoFocus placeholder="Item Name" />
            <Button type='submit'>Submit</Button>
          </>}
      </Popover>
    </BottomDrawerProvider>
  );
}
