import React from "react";
import LengthInput from "./LengthInput";

export default function NewItemInput({
  onSubmit,
}: {
  onSubmit: (name: string, length: number) => void;
}) {
  const [name, setName] = React.useState<string>("");
  const [length, setLength] = React.useState<number>(0);

  const onSaveClick = React.useCallback(() => {
    onSubmit(name, length);
  }, [length, name, onSubmit]);

  return (
    <>
      <NameInput name={name} setName={setName} />
      <LengthInput length={length} setLength={setLength} />
      <SaveButton onClick={onSaveClick} />
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
      key="nameInput"
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
