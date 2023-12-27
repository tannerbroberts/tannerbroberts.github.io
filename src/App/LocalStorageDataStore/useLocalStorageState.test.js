import { fireEvent, render, screen } from "@testing-library/react";
import { useLocalStorageState } from "./useLocalStorageState";
import LocalStorageProvider from "./LocalStorageProvider";

const Child1 = () => {
  const [state, setState] = useLocalStorageState("test", "initial");
  return (
    <button
      type="button"
      onClick={() => {
        setState("new");
      }}
    >
      {state}
    </button>
  );
};
const Child2 = () => {
  const [state] = useLocalStorageState("test", "secondary");
  return <div>{state}</div>;
};
const Parent = () => {
  return (
    <LocalStorageProvider>
      <Child1 />
      <Child2 />
    </LocalStorageProvider>
  );
};

describe("useLocalStorageState", () => {
  it("should update the state when localStorage is updated", async () => {
    const { rerender } = render(<Parent />);
    expect(screen.getAllByText("initial")[0]).toBeInTheDocument();
    fireEvent.click(screen.getAllByText("initial")[0]);
    rerender(<Parent />);
    expect(screen.getAllByText("new")[0]).toBeInTheDocument();
  });
});
