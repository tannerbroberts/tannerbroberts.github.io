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
      <div
        id="eventNames"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {store.current.allEventNames().map((name) => (
          <p
            key={name}
            style={{ backgroundColor: "lightblue" }}
            onClick={(e) =>
              setEvent(store.current.getEvent(e.target.innerHTML))
            }
          >
            {name}
          </p>
        ))}
      </div>
      {event && (
        <div key={"tempDisplay"}>
          <div>
            <h2>{event.name}</h2>
            <p>{event.length}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
