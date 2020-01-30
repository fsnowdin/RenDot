# Text-to-JSON-Parser

**NOTE: This is my own custom version of the parser meant for use within my own games. It contains support for monologues (no face sprite in the dialogue box) and custom character expressions. However, these changes have to be accompanied by changes to the Godot Dialogue System addon itself so I have made the master branch the general parser for default use.**

A parser that takes in a Ren'Py-like text script and parse it into a JSON file for importing into radmatt's [Godot Dialogue System](https://radmatt.itch.io/godot-dialogue-system).

# Installation

Clone the repository and navigate into its directory. The parser only need parser.py and a customizable script.txt to work.

# Usage

TODO: Write proper documentation for how to write scripts for the parser.

Write your script in the script.txt file. Here's an example script:
```
NAME: Example-Script // This will be the name of the output JSON file
// You can explain things or write notes with by using '//' to comment
Player, neutral: "Hello there, this is a dialogue."
Player, neutral: "How about we have a 3-second moment of silence?"
wait: 3
Player, neutral: "Let's log something to the console!"
// Execute GDScript inside the Godot Engine
execute: print('Hello world!')
Player, happy: "How about that!" 
Player, sad: "I can only make 3 faces unfornately..." // 3 basic character expressions currently: Neutral, Happy, Sad
mono: It's okay though. When I'm in my head, the possibilities are endless! // Monologue which means there are no face sprite in the dialogue box
// We can add a new character quite easily!
New-Character, neutral, final: "Just be sure to add a final key to the last line!"
```
Run parser.py to export the script as a JSON file for use with radmatt's [Godot Dialogue System](https://radmatt.itch.io/godot-dialogue-system).

# License
Licensed under the MIT license.
