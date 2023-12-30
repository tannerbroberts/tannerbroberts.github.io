# All notable changes to this project will be documented in this file.

## [1.0.0] - To Be Determined

While I'm technically hosting this on Github for anyone to see, this first version is the one that meets the general requirements here:
Data entry:
Item Entry
Name
Time start & end
Key: value pairs
Tags
Item Edits:
Adjust item start & end in calendar views
Add/remove variables
Add/remove tags
Prioritization view
Data display:
Schedule:
UpNext
Prioritized Day view
3 Day view
Horizontal Week view
Month view
Scrollable linear timeline view (any time length)
Display Item View:
Scrollable linear timeline view (any time length)
Item library
filter by:
Item name
Item length
Variable key/value
Tag
filter presets

# [0.16.0] December 29th, 2023

I started using the dayjs library. Apparently material UI works really well with it. I've started the very beginning of the time picker in the bottom drawer. I've also added the changelog as a visible part to the app.

### [0.15.0] December 29th, 2023

I added the beginnings of bottom drawer. It was just the same as left drawer, which was wonderful.

### [0.14.0] December 29th, 2023

I discovered that I want to declare my state variables inside of the providers that expose those variables. Doing so intentionally de-couples the initialization of that state from the components. I'm going to go ahead and say that that's a good thing. One benefit that I've seen is that I can move my context provider component freely. If I realize that I need my context, one level higher, it's a simple matter of moving that line, one level, higher, or cutting the provider out of the current file, and putting it in the file of its parent. The point is, the API is blazingly fast For updating provider scope.

I'm also very happy with my ability to replace the use state hook with use local storage. The local storage hook proves to do exactly the same thing as useState, except now I can sync a state variable with a data store from local storage. This is a game changer for me, because it provides the mechanism for loading, saving, updating, deleting items from multiple places in my app. All these updates are done for me so long as I use the "use local storage" hook in every place that consumes item data.

### [0.13.0] December 27th, 2023

We're cooking with gas now. I've got the loading mechanism all set up for localStorage
I can add and remove items from the library.
I'm displaying items created in either test item in the library
The library updates perfectly with all the clearing and adding and such
It'll be a bother when eventually, there are hundreds, thousands, tens of thousands of items in a library
But until then, I'm happy to keep using this super small minded version.

### [0.11.0] December 27th, 2023

useLocalStorage hook installed from uidotdev package... Better than writing it myself, amIRight?!

### [0.10.0] December 26th, 2023

useLocalStorageState introduced. It'll help with keeping up-to-date state values when dealing with state and localStorage.

### [0.8.0] December 25th, 2023

Merry Christmas!

### [0.6.3] - December 5th, 2023

I just learned what semver is 😅

# [0.0.0] - In the beginning was the word
and the word was with wife, and the word annoyed wife... For years...
#### until finally, the words started to get coded