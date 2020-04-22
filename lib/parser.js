// Parser back-end

const file_handler = require('./data.js');

let lib = {};

lib.parse = (script) => {

    // Init
    let node =  [{  
        "characters": [],
        "nodes": [{"next": "1", "node_name": "START", "node_type": "start"}],
        "languages": ['ENG'],
        "variables": {},
        "editor_version": "2.1"
    }];
    let characters = [];
    let current_node_index = 1;

    script = script.split('\n');
    for (let i = 0; i < script.length; i++) {

        console.log("Current parsing line " + i + ": " + script[i]);
        
        // Ignore if line has // which means to comment or line is empty
        if (script[i].indexOf('//') >= 0) {
            continue;
        } else if (script[i] === "") {
            continue;
        }

        let line = {
            "keys": script[i].split(':')[0],
            "value": script[i].split(':')[1].trim()
        };
        
        console.log(line.keys);

        // Run the line's respective keys
        if (line.keys.includes('execute')) {
            console.log("Add Execute node");
            let current_node = {
                "text": line.value,
                "node_name": current_node_index.toString(),
                "node_type": "execute",
                "next": (++current_node_index).toString()
            }
            node[0]["nodes"].push(current_node);
        } else if (line.keys.includes('wait')) {
            console.log("Add Wait node");
            let current_node = {
                "time": line.value,
                "node_name": current_node_index.toString(),
                "node_type": "wait",
                "next": (++current_node_index).toString()
            }
            node[0]["nodes"].push(current_node);
        } else if (line.keys.includes('mono')) {
            // Monologues
            console.log("Creating a monologue");
            let current_node = {
                "character": ["None"],
                "is_box": true,
                "speaker_type": 0,
                "text": {
                    "ENG": "text"
                },
                "slide_camera": false,
                "node_name": current_node_index.toString(),
                "node_type": "show_message",
                "face": null,
                "next": (++current_node_index).toString()
            }
            
            // Clean up the keys
            console.log('Clean up the keys');
            for (let j = 0; j < line.keys.length; j++) {
                line.keys[j] = line.keys[j].trim();
            };

            // Check if the text has a colon in it; concatenate strings to fix it
            console.log("Check if there is colon in the line tnxt")
            if (script[i].split(':').length > 2) {
                placeholder_array = [];
                for (let k = 1; k < script[i].length; k++) {
                    placeholder_array.push(script[i].split(':')[k]);
                }
                line.value = placeholder_array.join(":").trim();
            }

            // Start appending to current_node
            current_node["text"]["ENG"] = line.value;

            node[0]["nodes"].push(current_node);
        } else {
            // Normal dialogue 
            console.log("Creating normal dialogue");
            let current_node = {
                "character": [line.keys.split(',')[0]],
                "is_box": true,
                "speaker_type": 0,
                "text": {
                    "ENG": "text"
                },
                "slide_camera": false,
                "node_name": current_node_index.toString(),
                "node_type": "show_message",
                "face": null,
                "next": (++current_node_index).toString()
            }
            
            // Clean up the keys
            console.log('Clean up the keys');
            for (let j = 0; j < line.keys.length; j++) {
                line.keys[j] = line.keys[j].trim();
            };

            // Check if the text has a colon in it; concatenate strings to fix it
            console.log("Check if there is colon in the line tnxt")
            if (script[i].split(':').length > 2) {
                let placeholder_array = [];
                for (let k = 1; k < script[i].length; k++) {
                    placeholder_array.push(script[i].split(':')[k]);
                }
                line.value = placeholder_array.join(":").trim();
            }

            // Start appending to current_node

            if (!node[0]['characters'].includes(line.keys.split(',')[0])) {
                node[0]['characters'].push(line.keys.split(',')[0]);
            }

            current_node["text"]["ENG"] = line.value;

            // Set character expressions
            if (line.keys.includes('normal') || line.keys.includes('neutral')) current_node['face'] = 0;
            else if (line.keys.includes('happy')) current_node['face'] = 1;
            else if (line.keys.includes('sad')) current_node['face'] = 2;
            else if (line.keys.includes('shocked')) current_node['face'] = 3;
            else if (line.keys.includes('scared')) current_node['face'] = 4;

            node[0]["nodes"].push(current_node);
        }
    }
    // Finalize
    node[0]['nodes'][current_node_index-1]['next'] = null;
    return node;
}

module.exports = lib;