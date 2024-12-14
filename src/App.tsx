import React from "react";
import { Button, Fab } from "@mui/material";
import { EventStore, Event } from "./eventUtils";
import Sidebar from "./components/Sidebar";
import AddIcon from "@mui/icons-material/Add";
import NewEventPopup from "./components/NewEventPopup";
import EventDisplay from "./components/EventDisplay";

function App() {
  const [focusEvent, setFocusEvent] = React.useState<Event | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const store = React.useRef(EventStore.getList());

  const toggleSidebar = React.useCallback(() => {
    if (store.current.allEventNames().length > 0) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      alert("No events in the library.");
    }
  }, []);

  const handleSetEvent = React.useCallback(
    (event: Event) => {
      setFocusEvent(event);
      setIsSidebarOpen(false);
    },
    [setFocusEvent],
  );

  const handleOpenPopup = React.useCallback(() => {
    setIsPopupOpen(true);
  }, []);

  const handleClosePopup = React.useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const handleSaveEvent = React.useCallback(
    (newEvent: Event) => {
      setFocusEvent(newEvent);
    },
    [setFocusEvent],
  );

  return (
    <>
      <Button onClick={toggleSidebar}>
        {`Library (${store.current.allEventNames().length} Events)`}
      </Button>
      <Sidebar
        event={focusEvent}
        setEvent={handleSetEvent}
        isOpen={isSidebarOpen}
      />
      <div
        id="eventNames"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {store.current.allEventNames().map((name) => (
          <p key={name} style={{ backgroundColor: "lightblue" }}>
            {name}
          </p>
        ))}
      </div>
      {focusEvent && <EventDisplay event={focusEvent} />}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenPopup}
        style={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
      <NewEventPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSave={handleSaveEvent}
      />
    </>
  );
}

export default App;
