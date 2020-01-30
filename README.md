# Text-to-JSON-Parser

A parser that takes in a Ren'Py-like text script and parse it into a JSON file for importing into radmatt's [Godot Dialogue System](https://radmatt.itch.io/godot-dialogue-system).

# Installation

Clone the repository and navigate into its directory. The parser only need parser.py and a customizable script.txt to work.

# Usage

TODO: Write proper documentation for how to write scripts for the parser.

Write your script in the script.txt file. Here's an example script:
```
NAME: Example-Script // This will be the name of the output JSON file
// You can explain things or write notes with by using '//' to comment
Player: "Hello there, this is a dialogue."
Player: "How about we have a 3-second moment of silence?"
wait: 3 
Player: "Let's log something to the console!"
// Execute GDScript inside the Godot Engine
execute: print('Hello world!')
Player: "How about that!" 
// We can add a new character quite easily!
New-Character, final: "Just be sure to add a final key to the last line!"
```
Run parser.py to export the script as a JSON file for use with radmatt's [Godot Dialogue System](https://radmatt.itch.io/godot-dialogue-system).

# License
Licensed under the MIT license.
