import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { EventStore, Event } from "../eventUtils";

type SidebarProps = {
  event: Event | undefined;
  setEvent: (event: Event) => void;
  isOpen: boolean;
};

export default function Sidebar({ event, setEvent, isOpen }: SidebarProps) {
  const store = React.useRef(EventStore.getList());

  const handleClose = () => {
    if (event) {
      setEvent(event);
    }
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={isOpen}
      onClose={handleClose}
    >
      <List>
        {store.current.allEventNames().map((name) => {
          const listItemEvent = store.current.getEvent(name);
          return (
            <ListItem
              key={name}
              onClick={() => setEvent(listItemEvent)}
              selected={listItemEvent.name === event?.name}
            >
              <ListItemText
                primary={listItemEvent.name}
                secondary={`${listItemEvent.length} ms`}
              />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
