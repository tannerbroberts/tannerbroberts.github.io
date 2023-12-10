import React from "react";
import { render, screen } from "@testing-library/react";
import { AppContextProvider, useAppStateContext } from "./AppContext";

describe("AppContext", () => {
  it("shouled load state from local storage and set it in the reducer", () => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };

    // No need to use the real localStorage
    jest
      .spyOn(window, "localStorage", "get")
      .mockImplementation(() => localStorageMock);

    // Mock return value for localStorage.getItem
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ foo: "bar" })
    );

    // Consumer component that uses the context
    const TestComponent = () => {
      const state = useAppStateContext();
      return <div>{state.foo}</div>;
    };
    render(
      <AppContextProvider>
        <TestComponent />
      </AppContextProvider>
    );
    expect(localStorageMock.getItem).toHaveBeenCalledWith("*STATE*AppReducer");
    expect(screen.getByText("bar")).toBeInTheDocument();
  });
});
