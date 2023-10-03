This is an Obsidian plugin that provides additional commands for navigating your notes.

## Rationale

I have a few series of daily notes related to specific activities: work, personal journal, music sessions, etc.
Using this plugin, I can quickly navigate between, e.g., work or music daily notes.

## How to install

Either:

 - unzip the released zip file into `<your vault>/.obsidian/plugins/`,
 - or manually copy the released `main.js`, and `manifest.json` to `<your vault>/.obsidian/plugins/obsidian-navigator`.

## Features

In the current version, the plugin adds the following commands to navigate notes that are in the folder of the current note.

### Folder navigation

 - **Open previous/next note in the folder**
 - **Open first/last note in the folder**
 - **Open first/last note with today in name in the folder**: looks for today's date in the note names, and opens the first/last of those matches
 - **Open first/last note with same prefix in the folder**: looks for all notes that have the same prefix as the current one, and opens the first/last of those matches

Each of these commands has a variant for each of the following note sort orderings:

 - by name
 - by creation date
 - by modification date

### Last/New commands

The plugin also allows you to specify filename patterns that you can use to quickly create notes related to dates.

For instance, if you specify the `Work/Session #.canvas` pattern, using the **Last/New Work session** command will open the canvas related to the current day, e.g., `Work/Session 2023-10-03.canvas`, or create it if it doesn't exist.

There is also a variant, **Last Work session**, that doesn't create any new note if it doesn't exist, so you can start your navigation there.

## Shortcuts

Typically, you'll want to bind the commands to keyboard shortcuts.
To be able to quickly navigate in a folder, I use the following shortcuts:

 - `Cmd+Alt+J`: Open next note in the folder
 - `Cmd+Alt+K`: Open previous note in the folder
 - `Cmd+Alt+H`: Open first note with same prefix in the folder
 - `Cmd+Alt+L`: Open last note with same prefix in the folder

## Settings

 - **Today date format**: When looking for today's date in note names, uses this date format (Moment.js)
 - **Notes with same prefix**: Settings pertaining to the _Open first/last note with same prefix_ command
 	- **Separators**: The characters used to determine the common prefix.
 		- For instance, if ` ` (space) is in the separators, then the common prefix of `About Flowers` and `About Flexitarianism` will be `About`
 		- If empty, each character will be a token, so the common prefix of `About Flowers` and `About Flexitarianism` will be `About Fl`, which is not always what you'd want
 	- **Extend search**: When already at the first/last note with the same prefix as the current one, whether to go to the previous/next note to facilitate navigation
 - **Last/New command patterns**: A list of file patterns that can be used to generate file names (see _Last/New commands_ above)
