import React from 'react';
import BottomDrawerProvider from './Provider_BottomDrawer';
import BottomDrawerReducer, { BottomDrawerInitialState } from './Reducer_BottomDrawer';
import { Button, Input, Popover } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';
import { css } from '@emotion/css';

const formStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`

export default function BottomDrawer() {
  const [state, dispatch] = React.useReducer(BottomDrawerReducer, BottomDrawerInitialState);
  const { AboutTimeState } = useAboutTimeContext();
  const onSubmit = useNewItemFormSubmit({ state, dispatch });

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
            <form className={formStyle} onSubmit={onSubmit}>
              <Input
                autoFocus
                placeholder='Item Name'
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

function useNewItemFormSubmit({ state, dispatch }) {
  const { AboutTimeDispatch, extras: AboutTimeExtras } = useAboutTimeContext();
  return React.useCallback((e) => {
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
    if (isInvalid()) return;
    addItem();
    clearForm();
    closeDrawer();
  }, [AboutTimeDispatch, AboutTimeExtras, state, dispatch]);
}