    GamePlans:
        CSS:
            1) Every visible component has a grid, and is a child of grid by default, no exceptions
                a) Use gridTemplateRows for static sized components
                b)
            2) Many components fill the height and width 100%, leaving the layout to the parent
        Folder Structure:
            1) Components that appear only once inside of one other component will exist in a folder of that component.
            2) Shared components will live in the shared components folder
        State:
            1) Derrive what I can from the minimum amount of state possible
            2) absolutely no prop drilling!!! Okay, not really, but I really like context, so there's that.
            3) Prop drilling for components inside of a map function just cause that's easier than thinking about the alternatives
