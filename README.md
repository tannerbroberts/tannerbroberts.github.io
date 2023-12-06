    GamePlans:
        CSS:
            1) Every visible component has a grid, and is a child of grid by default
        Folder Structure:
            1) Components that appear only once inside of one other component will exist in a folder of that component.
            2) Shared components will live in the shared components folder
        State:
            1) Derrive what I can from the minimum amount of state possible
            2) Absolutely no prop drilling!!! JUST USE CONTEXT! IT DOES THE SAME THING, AND THERE'S NO REFACOR MESS!!!
