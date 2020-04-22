# Ren'Dot

**NOTE: This is my own custom version of the parser meant for use within my own games. It contains support for monologues and custom character expressions. However, these changes have to be accompanied by changes to the Godot Dialogue System addon itself so I have made the master branch the general parser for default use.**

A parser that takes in a Ren'Py-like text script and parse it into a JSON file for importing into radmatt's [Godot Dialogue System](https://radmatt.itch.io/godot-dialogue-system).

## Installation

Download the latest binary for your operating system [here](https://github.com/tghgg/Ren-Dot/releases/tag/untagged-9ea942bfec00d987d4a4) and run the executable.

## Usage

On your first start, Ren'Dot will ask you for a place to put produced JSON dialogues.

Write your script in the Ren'Dot editor. When you're done, hit the 'Parse Script' button and the output JSON dialogue will appear in the folder you chose when you first started Ren'Dot.

### Script Structure

TODO: Write proper documentation for how to write scripts for Ren'Dot.
```
NAME: Example-Script 
// The name above will be the name of the output JSON file and the clone script in Text-Scripts
// You can explain things or write notes with by using '//' to comment
Player, neutral: "Hello there, this is a dialogue."
Player, neutral: "How about we have a 3-second moment of silence?"
wait: 3
Player, neutral: "Let's log something to the console!"
// Execute GDScript inside the Godot Engine
execute: print('Hello world!')
Player, happy: "How about that!" 
// 3 basic character expressions currently: Neutral, Happy, Sad; more can be added
Player, sad: "I can only make 3 faces unfornately..." 
// Monologue which means there are no face sprite in the dialogue box
mono: It's okay though. When I'm in my head, the possibilities are endless! 
// We can add a new character quite easily
New-Character, neutral: "Hi! I'm new here!"
```

## License
Licensed under the MIT license.
