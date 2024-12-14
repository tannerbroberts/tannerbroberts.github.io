import React from "react";
import NewItemInput from "./components/NewItemInput";
import { Button } from "@mui/material";
import { EventStore, Event } from "./eventUtils";

function App() {
  const [event, setEvent] = React.useState<Event>();
  const store = React.useRef(EventStore.getList());

  const onSubmit = React.useCallback((name: string, length: number) => {
    const newEvent = store.current.create({ name, length });
    setEvent(newEvent);
  }, []);
  return (
    <>
      <NewItemInput onSubmit={onSubmit} />
      {event && (
        <div key={"tempDisplay"}>
          <Button
            variant="contained"
            onClick={() => console.log("button clicked, but not implemented")}
          >
            Event?
          </Button>
          <h2>{event.name}</h2>
          <p>{event.length}</p>
        </div>
      )}
    </>
  );
}

export default App;
