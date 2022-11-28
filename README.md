key:
    FILL: The story needs talk with Tanner, || is yet to be written
    DO: These are ready to be done. They have enough description to make the developer happy
    DONE: ... It's done... I don't know what else to say

STORIES:
    FILL:
        changes staging and saving
        Variables
            Variables can be added, removed, and combined
            Quotas
        Items can have color and pattern
        ItemFilter can filter based on length, variable condition, and name
        Give structural components one style

    DO:
        Build the calendar view:
            Build "Add to item" button's functionality

    DONE:
        Item deletion
        Item creation and saving
            Localstorage only does Strings, so made use of JSON.stringify and JSON.parse
            The Library only stores the names of the items and variables (for which there is still only one list)
        Load and save Library in reducer
        Give shared components one style

GamePlans:
    CSS:
        1) Every visible component has a grid, and is a child of grid by default unless there's some wizardry that needs be done, in which case, it will be documented here:
            a) The main App uses flexbox so that the main window resizes to take up the whole screen when the side panel is closed.
        2) Every component fills the height and width 100%
    Folder Structure:
        1) Components that appear only once inside of one other component will exist in a folder of that component.
    State:
        1) Make state as close to immutable as possible
        2) Derrive what I can from the minimum amount of state possible
