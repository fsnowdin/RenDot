
import json
import os
input_script_name = "script.txt"
out_script_name = "script"
out_script = 0
node = [{  # node[0]['nodes']
    "characters": [],
    "nodes": [{"next": "1","node_name": "START","node_type": "start"}],
    "languages": ['ENG'],
    "variables": {},
    "editor_version": "2.1"
}]
characters = []
variables = []
current_node_index = 1
node_template = {
    "character": [],
    "is_box": True,
    "speaker_type": 0,
    "text": {
        "ENG"
    }
}
final_found_flag = False
with open(input_script_name, 'r') as script:
    first_line = script.readline().split(':')
    if ('NAME' in first_line):

        out_script_name = '%s.json' % first_line[1].strip()
##        with open('%s.json' % first_line[1].strip(), 'w') as out_script:
##                json.dump(template, out_script)
    for line in script:

        
        if "execute" in line.split(":")[0]:
            current_node = {
                "text": line.split(":")[1].strip(),
                "node_name": str(current_node_index),
                "node_type": "execute",
                "next": str(current_node_index+1)
            }
            if ("final" not in line.split(":")[0]):
                current_node_index += 1
                current_node["next"] = str(current_node_index)
            elif ("final" in line.split(":")[0]):
                final_found_flag = True
                current_node["next"] = None
            node[0]["nodes"].append(current_node.copy())
##
##        elif "condition_branch" in in line.split(":")[0]:
##            current_node = {
##                "node_name": str(current_node_index),
##                "node_type": "set_local_variable",
##                "branches": {
##                    "False": line.split(":")[1].split(",")[1],
##                    "True": line.split(":")[1].split(",")[2]
##                },
##                "text": line.split(":")[1].split(",")[0]
##            }
##
##            node[0]["nodes"].append(current_node.copy())
            



            
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
            # check for variable tags
            if "SET" in keys:
                current_node["operation_type"] = "SET"
            elif "ADD" in keys:
                current_node["operation_type"] = "ADD"
            elif "SUBTRACT" in keys:
                current_node["operation_type"] = "SUBTRACT"
            if "toggle" in keys:
                current_noded["toggle"] = True
            if "0" in keys:
                var_type = 0
            elif "1" in keys:
                var_type = 1
            elif "2" in keys:
                var_type = 2 
            # check for variable name and variable value
          
               
            print ('awthohou')
            print (line.split(":")[1].split(",")[1].strip().upper())
            if line.split(":")[1].split(",")[1].strip().upper() == "TRUE":
                current_node["value"] = True
            elif line.split(":")[1].split(",")[1].strip().upper() == "FALSE":
                current_node["value"] = False
            elif line.split(":")[1].split(",")[1].strip().isdigit() == True: # isdigit only works when the number is positive ### IMPORTANT ### 
                current_node["value"] = int(line.split(":")[1].split(",")[1].strip())

            if current_node["var_name"] not in node[0]["variables"]:
                node[0]["variables"][current_node["var_name"]] = {
                    "type": var_type,
                    "value": current_node["value"]
                }
            print ("set for")
            print (current_node)
            # check for final tag
            if ("final" not in line.split(":")[0]):
                current_node_index += 1
                current_node["next"] = str(current_node_index)
            elif ("final" in line.split(":")[0]):
                final_found_flag = True
                current_node["next"] = None
            
            node[0]["nodes"].append(current_node.copy())
             
        else:
            current_node = {
                "character": ["sam"],
                "is_box": True,
                "speaker_type": 0,
                "text": {
                    "ENG": "text"
                },
                "node_name": "1",
                "node_type": "show_message",
                "face": None
            }

            # split the line into keys and text
            list = line.split(":")
            # list[0] contains keys which we separate by commas
            keys = list[0].split(",")
            for index in range(len(keys)):
                keys[index] = keys[index].strip()
            # list[1] is the dialogue text
            text = list[1].strip()

            # starts appending to current_node
            # keys, text
            # add in the current character
            if keys[0] not in node[0]["characters"]:
                node[0]["characters"].append(keys[0])
            current_node["character"][0] = keys[0]
            # add in the current text
            new_text = current_node["text"]
            new_text["ENG"] = text
            # add in the node name
            current_node["node_name"] = str(current_node_index)
            # add in the node type
            current_node["node_type"] = "show_message"
            # add in the face frame
            if "neutral" in keys:
                current_node["face"] = 0
            elif "happy" in keys:
                current_node["face"] = 1
            elif "sad" in keys:
                current_node["face"] = 2
            else:
                current_node["face"] = None
            # add in the next node
            if ("final" not in keys):
                current_node_index += 1
                current_node["next"] = str(current_node_index)
            elif ("final" in keys):
                final_found_flag = True
                current_node["next"] = None
            # finished adding
   
            # append current_node the the out_script node object
            node[0]["nodes"].append(current_node.copy())
    

 
    if (final_found_flag):
        with open(out_script_name, "w") as out_script:
            json.dump(node, out_script)
            print("finished")
            os.remove("BITCH YOU GOT NO FINAL TAG.json")
    else:
        with open("BITCH YOU GOT NO FINAL TAG.json", "w") as out_script:
            json.dump(node, out_script)
        print("NO FINAL TAG GET BACK IN HERE REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")
        
        
        
