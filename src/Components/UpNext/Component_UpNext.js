import React from 'react';
import UpNextProvider from './Provider_UpNext';
import UpNextReducer, { UpNextInitialState } from './Reducer_UpNext';
import { useAboutTimeContext } from '../AboutTime';
import { List, ListItem, ListItemText } from '@mui/material';

export default function UpNext() {
  const [state, dispatch] = React.useReducer(UpNextReducer, UpNextInitialState);
  const { extras: { schedule, library } } = useAboutTimeContext();

  return (
    <UpNextProvider {...{ state, dispatch }}>
      <List>
        {schedule.getItemsInWindow({ start: Date.now() - 360_000_000, end: Date.now() + 360_000_000 }).map((scheduledItem) => {
          const item = library.getItems({ names: [scheduledItem.itemName] })[0];

          return (
            <ListItem key={`${item.name}${scheduledItem.positionMillis}`}>
              <ListItemText primary={`item:${item.name} , length:${item.lengthMillis}`} secondary={`scheduled at:${scheduledItem.positionMillis}`} />
            </ListItem>
          )
        }
        )}
      </List>
    </UpNextProvider>
  );
}
