#!/usr/bin/python3
from json import dump
from PyQt5.QtWidgets import *

# Bring up the GUI 
app =QApplication([])
label = QLabel('Pick a file to parse')
# Create the file dialog
filepicker = QFileDialog()
button = QPushButton('Open File')
# Create the parser window
window = QWidget()
window.setWindowTitle('Parser')
# Set the parser window layout
layout = QVBoxLayout()
layout.addWidget(label)
layout.addWidget(button)
window.setLayout(layout)

# Show the file dialog when the button is clicked
filename =''
def open_file_dialog():
    # Declare variables
    node = [{  # node[0]['nodes']
        "characters": [],
        "nodes": [{"next": "1", "node_name": "START", "node_type": "start"}],
        "languages": ['ENG'],
        "variables": {},
        "editor_version": "2.1"
    }]
    current_node_index = 1
    # Open the file dialog
    filename = filepicker.getOpenFileName()
    # Identify the file to be parsed
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
                current_node_index += 1
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
                current_node_index += 1
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
                current_node_index += 1
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
                    "node_type": "show_message"
                }
                # split the line into keys and text
                list = line.split(":")
                keys = list[0].split(",")
                for index in range(len(keys)):
                    keys[index] = keys[index].strip()
                text = list[1].strip()
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

                # check for bubble dialogue
                # 2 types of bubble dialogue: no slide camera and slide camera
                # bubble depends on matching character names in the script file...
                # ...and the Godot Engine scene structure (root_node/main/character_name)
                if "bubble" in keys:
                    current_node["is_box"] = False
                    current_node["face"] = None
                elif "bubble_slide" in keys:
                    current_node["is_box"] = False
                    current_node["slide_camera"] = True
                    current_node["face"] = None
                current_node_index += 1
                node[0]["nodes"].append(current_node.copy())
        node[0]['nodes'][current_node_index-1]["next"] = None
        with open("./JSON Dialogues/%s" % output_script_name, "w") as output_script:
            dump(node, output_script)
            print("Finished parsing %s" % output_script.name)
            output_script.close()
        # Send finish message
        finish_message = QMessageBox(window)
        finish_message.setText('Finished parsing %s' % input_script_name.split('/')[len(input_script_name.split('/'))-1])
        finish_message.setWindowTitle('Finished!')
        finish_message.setWindowOpacity(0.8)
        finish_message.exec_()
        script.close()
# Connect the button to the file dialog
button.clicked.connect(open_file_dialog)
# Show the window
window.show()
app.exec_()
