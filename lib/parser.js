// Parser back-end

const lib = {};

lib.parse = (script) => {
  // Init
  const node = [{
    characters: [],
    nodes: [{ next: '1', node_name: 'START', node_type: 'start' }],
    languages: ['ENG'],
    variables: {},
    editor_version: '2.1'
  }];
  let currentNodeIndex = 1;

  script = script.split('\n');
  for (let i = 0; i < script.length; i++) {
    console.log('Current parsing line ' + i + ': ' + script[i]);

    // Ignore if line has // which means to comment or line is empty
    if (script[i].indexOf('//') >= 0) {
      continue;
    } else if (script[i] === '') {
      continue;
    }

    const line = {
      keys: script[i].split(':')[0],
      value: script[i].split(':')[1].trim()
    };

    // Run the line's respective keys
    if (line.keys.includes('execute') || line.keys.includes('Execute')) {
      console.log('Add Execute node');
      const currentNode = {
        text: line.value,
        node_name: currentNodeIndex.toString(),
        node_type: 'execute',
        next: (++currentNodeIndex).toString()
      };
      node[0].nodes.push(currentNode);
    } else if (line.keys.includes('wait') || line.keys.includes('Wait')) {
      console.log('Add Wait node');
      const currentNode = {
        time: Number(line.value),
        node_name: currentNodeIndex.toString(),
        node_type: 'wait',
        next: (++currentNodeIndex).toString()
      };
      node[0].nodes.push(currentNode);
    } else if (line.keys.includes('mono') || line.keys.includes('Mono')) {
      // Monologues
      console.log('Creating a monologue');
      const currentNode = {
        character: ['None'],
        is_box: true,
        speaker_type: 0,
        text: {
          ENG: 'text'
        },
        slide_camera: false,
        node_name: currentNodeIndex.toString(),
        node_type: 'show_message',
        face: null,
        next: (++currentNodeIndex).toString()
      };

      // Clean up the keys
      console.log('Clean up the keys');
      for (let j = 0; j < line.keys.length; j++) {
        line.keys[j] = line.keys[j].trim();
      }

      // Check if the text has a colon in it; concatenate strings to fix it
      console.log('Check if there is colon in the line tnxt');
      if (script[i].split(':').length > 2) {
        const placeholderArray = [];
        for (let k = 1; k < script[i].split(':').length; k++) {
          placeholderArray.push(script[i].split(':')[k]);
        }
        line.value = placeholderArray.join(':').trim();
      }

      // Start appending to currentNode
      currentNode.text.ENG = line.value;

      node[0].nodes.push(currentNode);
    } else {
      // Normal dialogue
      console.log('Creating normal dialogue');
      const currentNode = {
        character: [line.keys.split(',')[0]],
        is_box: true,
        speaker_type: 0,
        text: {
          ENG: 'text'
        },
        slide_camera: false,
        node_name: currentNodeIndex.toString(),
        node_type: 'show_message',
        face: null,
        next: (++currentNodeIndex).toString()
      };

      // Clean up the keys
      console.log('Clean up the keys');
      for (let j = 0; j < line.keys.length; j++) {
        line.keys[j] = line.keys[j].trim();
      }

      // Check if the text has a colon in it; concatenate strings to fix it
      console.log('Check if there is colon in the line tnxt');
      if (script[i].split(':').length > 2) {
        const placeholderArray = [];
        for (let k = 1; k < script[i].split(':').length; k++) {
          placeholderArray.push(script[i].split(':')[k]);
        }
        line.value = placeholderArray.join(':').trim();
      }

      // Start appending to currentNode

      if (!node[0].characters.includes(line.keys.split(',')[0])) {
        node[0].characters.push(line.keys.split(',')[0]);
      }

      currentNode.text.ENG = line.value;

      // Set character expressions
      if (line.keys.includes('normal') || line.keys.includes('neutral')) currentNode.face = 0;
      else if (line.keys.includes('happy')) currentNode.face = 1;
      else if (line.keys.includes('sad')) currentNode.face = 2;
      else if (line.keys.includes('shocked')) currentNode.face = 3;
      else if (line.keys.includes('scared')) currentNode.face = 4;
      else if (line.keys.includes('thinking') || line.keys.includes('curious')) currentNode.face = 5;
      else if (line.keys.includes('embarrassed')) currentNode.face = 6;

      node[0].nodes.push(currentNode);
    }
  }
  // Finalize
  node[0].nodes[currentNodeIndex - 1].next = null;
  return node;
};

module.exports = lib;
