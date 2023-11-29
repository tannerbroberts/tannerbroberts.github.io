    FILL:
        Variables
            Variables can be added, edited, and removed
            Variable Summaries are calculated and displayed
                Shelf needs a variable display
            Quotas
        Accountability view
        Shelf:
            ItemFilter: filterName filterProperties
                ItemFilter for every drawer showing the active filters for that drawer
                ItemFilter can filter based on length, variables, and name
                    Variable filtering can be multiple conditions (i.e. less than 600 calories, more than 60g protein)
        BaseCalendarView
            Item data has a place to live and a way of accessing it
            Items can be added and removed
            View modes:
                A scroll-view for:
                    day, week, month, and year
                RealTime view
                Any other view that people think would be nice
        ViewItem
            Time Units at the end of a schedule reflect partial units (30 minute item looks like half an hour on hour view)
        Item Library is basically just no filter, any other preset filters live below
        Mobile View closes shelf onViewItemClick and onAddItem
    STORIES:
        DO:
            Build a shared timeInput
            TimeWindow
                appears onAddItem along with the item block
                schedule submit button
                BackgroundSection
                    onLongPressListener
                    partial sections
            AddItem onClickListener
            Add title props and state for popup title
        DONE:
            Scheduler option on block
            BUG: Click listeners for addItem are broken, no ls data to work with for ItemSchedulerAddon
            BUG: Click listeners for ItemSchedulerAddon are broken
            timeWindowBaseItem needs work
            Fix Time Window CSS
            Fix time picker CSS
            Move new item button to shelf
            Move buttons to children of a list item
            Create a common style for "elements that take a fixed screen height and have a label"
            Make the shelf, popup, and main screen play nice with eachother, position: absolute, 100% width
            Standardize css: All components have the cssHelper object in their styles
            BUG: Layout doesn't fit mobile screen
            block onLongClickListener
            Item Blocks
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
