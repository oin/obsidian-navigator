This is an Obsidian plugin that provides additional commands for navigating your notes.

## How to install

Either:

 - unzip the released zip file into `<your vault>/.obsidian/plugins/`,
 - or manually copy the released `main.js`, `styles.css`, and `manifest.json` to `<your vault>/.obsidian/plugins/obsidian-navigator`.

## Features

In the current version, the plugin adds the following commands to navigate notes that are in the folder of the current note.

 - **Open previous/next note in the folder**
 - **Open first/last note in the folder**
 - **Open first/last note with today in name in the folder**: looks for today's date in the note names, and opens the first/last of those matches
 - **Open first/last note with same prefix in the folder**: looks for all notes that have the same prefix as the current one, and opens the first/last of those matches

Each of these commands has a variant for each of the following note sort orderings:

 - by name
 - by creation date
 - by modification date

## Settings

 - **Today date format**: When looking for today's date in note names, uses this date format (Moment.js)
 - **Notes with same prefix**: Settings pertaining to the _Open first/last note with same prefix_ command
 	- **Separators**: The characters used to determine the common prefix.
 		- For instance, if ` ` (space) is in the separators, then the common prefix of `About Flowers` and `About Flexitarianism` will be `About`, so the 
 		- If empty, each character will be a token, so `About Flowers` and `About Flexitarianism` will have 
 	- **Extend search**: When already at the first/last note with the same prefix as the current one, whether to go to the previous/next note to facilitate navigation

## Status

I'm only using the _by name_ ordering, so I'm not sure the plugin behaves correctly for the other orderings.
