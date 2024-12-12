import React from "react";
import { Event } from "./utils";
import LengthInput from "./components/LengthInput";

function App() {
  const [name, setName] = React.useState<string>("");
  const [length, setLength] = React.useState<number>(0);
  const [event, setEvent] = React.useState<Event | null>(null);

  const onSave = React.useCallback(() => {
    setEvent(new Event({ name, length }));
  }, [name, length]);
  return (
    <>
      <div style={{ display: "flex" }}>
        <NameInput name={name} setName={setName} />
        <LengthInput length={length} setLength={setLength} />
        <SaveButton onClick={onSave} />
      </div>
      {event && (
        <div>
          <h2>{event.name}</h2>
          <p>{event.length}</p>
        </div>
      )}
    </>
  );
}

function NameInput({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void;
}) {
  return (
    <input
      style={{ fontSize: "1em" }}
      type="text"
      placeholder="Event Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Save</button>;
}

export default App;
