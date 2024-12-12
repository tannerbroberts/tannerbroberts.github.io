import React from "react";
import { EventStore, Event } from "./eventStore";
import NewItemInput from "./components/NewItemInput";
import { Button } from "@mui/material";

function App() {
  const [event, setEvent] = React.useState<Event>();

  const onSubmit = React.useCallback((name: string, length: number) => {
    setEvent(EventStore.getList().create({ name, length }));
  }, []);
  return (
    <>
      <NewItemInput onSubmit={onSubmit} />
      {event && (
        <div>
          <Button
            variant="contained"
            onClick={() => console.log("button clicked")}
          ></Button>
          <h2>{event.name}</h2>
          <p>{event.length}</p>
        </div>
      )}
    </>
  );
}

export default App;
