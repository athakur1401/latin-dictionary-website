# Latin Dictionary Website

A simple, in-browser Latin dictionary that lets you look up Latin words and see a basic definition.

## What it currently does

- **Loads a built-in dictionary file**
  - When the page opens, the site loads a local JSON dictionary file (`assets/lemmas.json`) containing Latin headwords (lemmas) and their info. (it still needs a lot of parsing, so some words might not work)

- **Lets you look up a Latin word**
  - Type a Latin word into the input box and press **Lookup** (or press **Enter**).
  - If the word is found, it shows:
    - the **lemma** (main dictionary form)
    - the **part of speech** (when available)
    - a **definition**

    it shows it all in a big paragraph, we need to add UI and make it buetiful

- **Handles macrons in a forgiving way**
  - Searches are **macron-insensitive**, meaning it tries to treat letters like `ā` and `a` as the same for lookups.

- **Basic “tabs” UI**
  - There are two tabs:
    - **Definition** (where results show up)
    - **Inflections** (placeholder panel for now)

## What’s not finished yet (and known rough edges)

- **Inflections are not fully wired up**
  - The Inflections tab is mostly a placeholder right now and doesn’t reliably generate tables/forms from the dictionary entry yet.

- **There are still a lot of bugs**
  - Some words won’t be found even if you expect them to be.
  - Some entries may be missing details or show incomplete formatting.
  - Error handling is minimal, so if the dictionary file doesn’t load correctly, things may break in confusing ways.

## How to run it

- Download/clone the repo
- Open `index.html` in a browser (or serve the folder with any simple local web server or open a github pages(most reliable way of opening it)



## Project status

This is an early, work-in-progress project. It’s usable for basic lookups, but it still needs cleanup, better inflections support, and bug fixes.
