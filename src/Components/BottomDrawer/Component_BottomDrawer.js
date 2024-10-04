import React from 'react';
import BottomDrawerProvider from './Provider_BottomDrawer';
import BottomDrawerReducer, { BottomDrawerInitialState } from './Reducer_BottomDrawer';
import { Button, Input, Popover } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';

export default function BottomDrawer() {
  const [state, dispatch] = React.useReducer(BottomDrawerReducer, BottomDrawerInitialState);
  const { AboutTimeState, AboutTimeDispatch, extras: AboutTimeExtras } = useAboutTimeContext();

  const onSubmit = React.useCallback((e) => {
    const isInvalid = () => {
      const itemExistsAlready = AboutTimeExtras.library.items[state.newItemName];
      const itemIsEmpty = state.newItemName === '';
      return itemExistsAlready || itemIsEmpty;
    }
    const addItem = () => {
      AboutTimeExtras.library.setItem({
        name: state.newItemName,
        length: state.newItemLength
      });
    }
    const clearForm = () => {
      dispatch({
        type: 'BATCH', value: [
          { type: 'SET_NEW_ITEM_NAME', payload: '' },
          { type: 'SET_NEW_ITEM_LENGTH', payload: 3_600_000 }
        ]
      })
    }
    const closeDrawer = () => {
      AboutTimeDispatch({ type: 'TOGGLE_BOTTOM_DRAWER' });
    }

    // Don't reload the page
    e.preventDefault();
    if(isInvalid()) return;
    addItem();
    clearForm();
    closeDrawer();
  }, [AboutTimeDispatch, state, AboutTimeExtras]);

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
            <form onSubmit={onSubmit}>
              <Input
                type='text'
                value={state.newItemName}
                onChange={(e) => dispatch({ type: 'SET_NEW_ITEM_NAME', payload: e.target.value })}
              />
              <Input
                label="Item Length (ms)"
                type="number"
                value={state.newItemLength}
                onChange={(e) => dispatch({ type: 'SET_NEW_ITEM_LENGTH', payload: e.target.value })}
              />

              <Button type='submit'>Submit</Button>
            </form>
          </>
        }
      </Popover>
    </BottomDrawerProvider>
  );
}
