key:
    FILL: The story needs talk with Tanner, || is yet to be written
    DO: These are ready to be done. They have enough description to make the developer happy
    DONE: ... It's done... I don't know what else to say

STORIES:
    FILL:
        Variables
            Variables can be added, removed, and combined
            Variable Summaries
            Quotas
        Item RealTime view
        Accountability view
        ItemFilter: filterName filterProperties
            ItemFilter can filter based on length, variable condition, and name
        BaseCalendarView
        ViewItem
        Item Library is basically just no filter, any other preset filters live below
        Mobile View closes shelf onViewItemClick and onAddItem

    DO:
        TimeWindow
            Item Blocks
            Scheduler option on block
                appears onAddItem along with the new block
                schedule submit button
            BackgroundSection
                onLongPressListener
                partial sections
        AddItem onClickListener

    DONE:
            TimeScale
                Scale input setter thing
                ClickListeners
                State
                time block Labels
        BUG: BackgroundSections aren't rendering
        DeleteItem
        ItemList
        ItemListChild
        CreateNewItem
        BreadCrumbs
        Shelf
        GlobalContext
        ItemCreatePopup
        Popup

GamePlans:
    CSS:
        1) Every visible component has a grid, and is a child of grid by default unless there's some wizardry that needs be done, in which case, it will be documented here:
            a) The main App uses flexbox so that the main window resizes to take up the whole screen when the side panel is closed.
        2) Every component fills the height and width 100%
    Folder Structure:
        1) Components that appear only once inside of one other component will exist in a folder of that component.
        2) Shared components will live in the shared components folder
    State:
        1) Derrive what I can from the minimum amount of state possible
        2) absolutely no prop drilling!!! Okay, not really, but I really like context, so there's that.