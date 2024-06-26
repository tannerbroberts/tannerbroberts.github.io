# All notable changes to this project will be documented in this file.

## [1.0.0] - To Be Determined
### As soon as I use this app consistently for my nutritional needs, I'll know it's good enough to call it 1.0.0
While I'm technically hosting this on Github for anyone to see, this first version is the one that meets the general requirements here:

- Fun fact:
  - This app works without the internet... All you need to do is visit the site once.
- Item template library:
  - filter presets
  - filter by:
    - Item name
    - Item length
    - Variable name
    - Variable value
    - Tag name
- Item Templates have:
  - Name
  - Length
  - Variables
  - Child variable summaries
  - Tags
- Scheduled Items have:
  - Item Template
  - Start time
- Schedule view types:
  - Scrollable linear timeline view (any time length)
- More technical details
  - The idea of vertical layers of development in the clean architecture mindset is that a user interacting with a feature on the outside will interact with only certain blocks of code, And that the developers mindset should account for that. The developers should organize their code in a way that makes thinking about user-identifiable features second nature. For example, the creation of an item is a very complicated thing, lots to remember, but a user thinks about separate ideas within the scope of creating a new item. So especially when the concept starts getting more involved for me as a developer, what I should do is start thinking of features from the users', perspective, building out a full user-identifiable feature, hooking it into the necessary context and API's, and making sure that feature is separated in all possible ways from other features.
  - Let's take the idea of a item name. The name will end up being very important because it serves as both an identifier for the user in that moment, but also as an identifier for the app at all times afterwards.
  - I wrote a decent blog post about it, but I'm not going to tell you where it is, because that's what lazy developers do, and I hope you suffer the way a junior developer does in badly written code.


# [0.18.0] January 6th, 2024

Adds name and template validation, giving special consideration to the overlap between template and name updates.

# [0.17.0] January 5th, 2024

The bottomsheet is prooving to be one of the more complex issues. Of course, I didn't realize just how many details there are associated with the creation of a new template/item. The entire point of the app is that the details be handled seamlessly, so I really should have seen this comming. Anyhow, it's been a bit of a slog because my expectations were too high to begin with. I now unserstand that it's going to take a long time, and I've adjusted my expectations. Ahh.. Sweet therapy.

# [0.16.0] December 29th, 2023

I started using the dayjs library. Apparently material UI works really well with it. I've started the very beginning of the time picker in the bottom drawer. I've also added the changelog as a visible part to the app.

### [0.15.0] December 29th, 2023

I added the beginnings of bottom drawer. It was just the same as left drawer, which was wonderful.

### [0.14.0] December 29th, 2023

I discovered that I want to declare my state variables inside of the providers that expose those variables. Doing so intentionally de-couples the initialization of that state from the components. I'm going to go ahead and say that that's a good thing. One benefit that I've seen is that I can move my context provider component freely. If I realize that I need my context, one level higher, it's a simple matter of moving that line, one level, higher, or cutting the provider out of the current file, and putting it in the file of its parent. The point is, the API is blazingly fast For updating provider scope.

I'm also very happy with my ability to replace the use state hook with use local storage. The local storage hook proves to do exactly the same thing as React.useState, except now I can sync a state variable with a data store from local storage. This is a game changer for me, because it provides the mechanism for loading, saving, updating, deleting items from multiple places in my app. All these updates are done for me so long as I use the "use local storage" hook in every place that consumes item data.

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
