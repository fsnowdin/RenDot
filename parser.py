#!/usr/bin/python
import json
import os
from PyQt5.QtWidgets import *

# Bring up the GUI
app = QApplication([])
# Create the parser window
window = QWidget()
window.setWindowTitle('Parser')
# Add stuff
label = QLabel('Pick a file to parse')
# Create the file dialog
filepicker = QFileDialog(window)
button = QPushButton('Open File')
# Set the window layout
layout = QVBoxLayout()
layout.addWidget(label)
layout.addWidget(button)
window.setLayout(layout)

# Show the file dialog when the button is clicked
filename = ''


def open_file_dialog():
    # Declare variables
    out_script_name = "script"
    out_script = 0
    node = [{  # node[0]['nodes']
        "characters": [],
        "nodes": [{"next": "1", "node_name": "START", "node_type": "start"}],
        "languages": ['ENG'],
        "variables": {},
        "editor_version": "2.1"
    }]
    characters = []
    variables = []
    current_node_index = 1
    final_found_flag = False
    # Open the file dialog
    filename = filepicker.getOpenFileName()
    # Identify the file to be parsed
    # input_script_name = filename[0].split('/')[len(filename[0].split('/'))-1]
    input_script_name = filename[0]
    # Do the parsing
    with open(input_script_name, 'r') as script:
        first_line = script.readline().split(':')
        # Set the name of the JSON script
        if ('NAME' in first_line):
            output_script_name = '%s.json' % first_line[1].strip()
            print('Parsing %s' % first_line[1].strip())
        # Start parsing the body of the script
        for line in script:
            # Print out currently parsing line for debugging purposes
            print('Currenly parsing %s' % line)
            # Check for script keys and run their respective methods
            if "execute" in line.split(":")[0]:
                current_node = {
                    "text": line.split(":")[1].strip(),
                    "node_name": str(current_node_index),
                    "node_type": "execute",
                    "next": str(current_node_index+1)
                }
                # check for final key for finalizing the script
                if ("final" not in line.split(":")[0]):
                    current_node_index += 1
                    current_node["next"] = str(current_node_index)
                elif ("final" in line.split(":")[0]):
                    final_found_flag = True
                    current_node["next"] = None
                node[0]["nodes"].append(current_node.copy())

            # Conditional branching implementation
            # elif "condition_branch" in in line.split(":")[0]:
            # current_node = {
            # "node_name": str(current_node_index),
            # "node_type": "set_local_variable",
            # "branches": {
            # "False": line.split(":")[1].split(",")[1],
            # "True": line.split(":")[1].split(",")[2]
            # },
            # "text": line.split(":")[1].split(",")[0]
            # }
            #
            # node[0]["nodes"].append(current_node.copy())

            # Comment scripts with //
            elif '//' in line:
                continue

            # Wait key
            # Wait for a number of seconds before continuing the script
            elif "wait" in line.split(":")[0]:
                current_node = {
                    "time": float(line.split(":")[1].strip()),
                    "node_name": str(current_node_index),
                    "node_type": "wait",
                    "next": str(current_node_index+1)
                }
                if ("final" not in line.split(":")[0]):
                    current_node_index += 1
                    current_node["next"] = str(current_node_index)
                elif ("final" in line.split(":")[0]):
                    final_found_flag = True
                    current_node["next"] = None
                # append current_node the the output_script node object
                node[0]["nodes"].append(current_node.copy())

            # Set variables in scripts
            elif "set" in line.split(":")[0]:
                current_node = {
                    "node_name": str(current_node_index),
                    "node_type": "set_local_variable",
                    "operation_type": None,
                    "toggle": False,
                    "value": line.split(":")[1].split(",")[1].strip(),
                    "var_name": line.split(":")[1].split(",")[0].strip(),
                    "next": str(current_node_index+1)
                }
                # split the line into keys and text
                list = line.split(":")
                # list[0] contains keys which we separate by commas
                keys = list[0].split(",")
                for index in range(len(keys)):
                    keys[index] = keys[index].strip()
                print(line.split(":")[1].split(",")[1].strip().upper())
                # check for which variable operation to use
                if "SET" in keys:
                    current_node["operation_type"] = "SET"
                elif "ADD" in keys:
                    current_node["operation_type"] = "ADD"
                elif "SUBTRACT" in keys:
                    current_node["operation_type"] = "SUBTRACT"
                if "toggle" in keys:
                    current_node["toggle"] = True
                if "0" in keys:
                    var_type = 0
                elif "1" in keys:
                    var_type = 1
                elif "2" in keys:
                    var_type = 2
                # check for variable name and variable value
                if line.split(":")[1].split(",")[1].strip().upper() == "TRUE":
                    current_node["value"] = True
                elif line.split(":")[1].split(",")[1].strip().upper() == "FALSE":
                    current_node["value"] = False
                # isdigit only works when the number is positive ### IMPORTANT ###
                elif line.split(":")[1].split(",")[1].strip().isdigit() == True:
                    current_node["value"] = int(
                        line.split(":")[1].split(",")[1].strip())
                # add in the variable if it hasn't been created yet
                if current_node["var_name"] not in node[0]["variables"]:
                    node[0]["variables"][current_node["var_name"]] = {
                        "type": var_type,
                        "value": current_node["value"]
                    }
                # check for final key for finalizing the script
                if ("final" not in line.split(":")[0]):
                    current_node_index += 1
                    current_node["next"] = str(current_node_index)
                elif ("final" in line.split(":")[0]):
                    final_found_flag = True
                    current_node["next"] = None
                # append current_node the the output_script node object
                node[0]["nodes"].append(current_node.copy())

            # Monologue
            # Essentially means no face sprite for the dialogue box
            elif 'mono' in line.split(":")[0]:
                current_node = {
                    "character": ["None"],
                    "is_box": True,
                    "speaker_type": 0,
                    "text": {
                        "ENG": "text"
                    },
                    "slide_camera": False,
                    "node_name": "1",
                    "node_type": "show_message",
                    "face": None
                }
                # split the line into keys and text
                list = line.split(":")
                keys = list[0].split(",")
                for index in range(len(keys)):
                    keys[index] = keys[index].strip()
                # check if the text has a colon in it
                if len(line.split(":")) > 2:
                    new_array = []
                    for i in range(1, len(line.split(":"))):
                        new_array.append(line.split(":")[i])
                    text = ":".join(new_array).strip()
                else:
                    text = line.split(":")[1].strip()
                # starts appending to current_node
                new_text = current_node["text"]
                new_text["ENG"] = text
                current_node["node_name"] = str(current_node_index)
                current_node["node_type"] = "show_message"
                # check for final key for finalizing the script
                if ("final" not in keys):
                    current_node_index += 1
                    current_node["next"] = str(current_node_index)
                elif ("final" in keys):
                    final_found_flag = True
                    current_node["next"] = None
                # append current_node the the output_script node object
                node[0]["nodes"].append(current_node.copy())

            # Normal box/bubble dialogue with a face sprite
            else:
                current_node = {
                    "character": ["None"],
                    "is_box": True,
                    "speaker_type": 0,
                    "text": {
                        "ENG": "text"
                    },
                    "slide_camera": False,
                    "node_name": "1",
                    "node_type": "show_message",
                    "face": None
                }
                # split the line into keys and text
                list = line.split(":")
                keys = list[0].split(",")
                for index in range(len(keys)):
                    keys[index] = keys[index].strip()
                # check if the text has a colon in it
                if len(line.split(":")) > 2:
                    new_array = []
                    for i in range(1, len(line.split(":"))):
                        new_array.append(line.split(":")[i])
                    text = ":".join(new_array).strip()
                else:
                    text = line.split(":")[1].strip()
                # starts appending to current_node
                # add in the current character
                if keys[0] not in node[0]["characters"]:
                    node[0]["characters"].append(keys[0])
                current_node["character"][0] = keys[0]
                new_text = current_node["text"]
                # potential for easy localization with new_text combined with enviroment variables
                new_text["ENG"] = text
                current_node["node_name"] = str(current_node_index)
                current_node["node_type"] = "show_message"
                # check for final key for finalizing the script
                if ("final" not in keys):
                    current_node_index += 1
                    current_node["next"] = str(current_node_index)
                elif ("final" in keys):
                    final_found_flag = True
                    current_node["next"] = None
                # check for bubble dialogue
                # 2 types of bubble dialogue: no slide camera and slide camera
                # bubble depends on matching character names in the script file...
                # ...and the Godot Engine scene structure (root_node/Characters/character_name)
                if "bubble" in keys:
                    current_node["is_box"] = False
                    current_node["face"] = None
                elif "bubble_slide" in keys:
                    current_node["is_box"] = False
                    current_node["slide_camera"] = True
                    current_node["face"] = None
                # Use box dialogue by default
                else:
                    # Character expressions
                    if "neutral" in keys:
                        current_node["face"] = 0
                    elif "happy" in keys:
                        current_node["face"] = 1
                    elif "sad" in keys:
                        current_node["face"] = 2
                    else:
                        current_node["face"] = None
                # append current_node the the output_script node object
                node[0]["nodes"].append(current_node.copy())
        # Check for final key in the last script line
        # Add it in automatically if the script doesn't have one
        if (final_found_flag):
            with open(output_script_name, "w") as output_script:
                json.dump(node, output_script)
                print("Finished parsing %s" % output_script.name)
                output_script.close()
        else:
            node[0]['nodes'][current_node_index-1]["next"] = None
            with open(output_script_name, "w") as output_script:
                json.dump(node, output_script)
                print("Finished parsing %s" % output_script.name)
                output_script.close()
        # Send finish message
        finish_message = QMessageBox()
        finish_message.setText('Finished parsing %s' % input_script_name.split(
            '/')[len(input_script_name.split('/'))-1])
        finish_message.setWindowTitle('Finished!')
        finish_message.setWindowOpacity(0.9)
        finish_message.exec_()
        script.close()


# Connect the button to the file dialog
button.clicked.connect(open_file_dialog)
# Show the window
window.show()
app.exec_()
