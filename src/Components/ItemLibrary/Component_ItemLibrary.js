import React from 'react';
import ItemLibraryProvider from './Provider_ItemLibrary';
import ItemLibraryReducer, { ItemLibraryInitialState } from './Reducer_ItemLibrary';
import { ListItem, ListItemText } from '@mui/material';
import { useAboutTimeContext } from '../AboutTime';

export default function ItemLibrary() {
  const [state, dispatch] = React.useReducer(ItemLibraryReducer, ItemLibraryInitialState);
  const { extras: { library } } = useAboutTimeContext();

  return (
    <ItemLibraryProvider {...{ state, dispatch }}>
      {library.getItems({}).map((item) => (
        <ListItem key={item.name}>
          <ListItemText primary={item.name} secondary={item.lengthMillis} />
        </ListItem>
      ))
      }
    </ItemLibraryProvider >
  );
}
