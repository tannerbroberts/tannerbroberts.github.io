import React from 'react';
import ItemLibraryProvider from './Provider_ItemLibrary';
import ItemLibraryReducer, { ItemLibraryInitialState } from './Reducer_ItemLibrary';
import { ListItem, ListItemText } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';

export default function ItemLibrary() {
  const [state, dispatch] = React.useReducer(ItemLibraryReducer, ItemLibraryInitialState);
  const { extras: { library: { items } } } = useAboutTimeContext();

  return (
    <ItemLibraryProvider {...{ state, dispatch }}>
      {Object.entries(items).map(([key, value]) => (
        <ListItem key={key}>
          <ListItemText primary={value.name} secondary={value.length} />
        </ListItem>
      ))
      }
    </ItemLibraryProvider >
  );
}
