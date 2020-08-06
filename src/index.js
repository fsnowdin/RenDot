'use strict';
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const { basename, extname, join, dirname } = require('path');

const DataHandler = require('../lib/data.js');
const Parser = require('../lib/parser.js');
const Promptr = require('../lib/promptr/prompt.js');

const EMOTES_LIST_PATH = join(app.getPath('userData'), 'emotes.json');

let MainWindow;

const MENU = [
  {
    label: 'File',
    submenu: [{
      label: 'New Script',
      accelerator: 'CommandOrControl+Shift+N',
      click: () => {
        MainWindow.webContents.send('new-script');
      }
    },
    {
      label: 'Open Script',
      accelerator: 'CommandOrControl+Shift+A',
      click: () => {
        dialog.showOpenDialog(MainWindow, {
          filters: [{
            name: '.txt', extensions: ['txt']
          }, {
            name: 'All Files', extensions: ['*']
          }],
          properties: ['openFile'],
          defaultPath: join(DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'Text Scripts')
        }).then((fileObject) => {
          if (fileObject.canceled) return;
          // Set the editor's text to the new script text
          // Set the script name correctly if the user specified a folder the script should be saved in when they wrote it
          let filename = basename(fileObject.filePaths[0], extname(fileObject.filePaths[0]));
          if (dirname(dirname(fileObject.filePaths[0])) === join(DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'Text Scripts')) {
            filename += `; ${basename(dirname(fileObject.filePaths[0]))}`;
          }
          MainWindow.webContents.send('open-script', {
            name: filename,
            value: DataHandler.readSync(fileObject.filePaths[0])
          });
        }, (err) => {
          if (err) dialog.showErrorBox('Error', 'Failed to open new script');
        });
      }
    }, {
      label: 'Save Script',
      accelerator: 'CommandOrControl+S',
      click: () => {
        MainWindow.webContents.send('empty-check');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Add Emote',
      click: () => {
        Promptr.prompt('Emote to add').then((newEmote) => {
          Promptr.prompt(`What is ${newEmote}'s index?`).then((index) => {
            index = Number(index);
            if (index > 0) {
              Parser.Emotes.addEmote(newEmote, index);
              DataHandler.update(EMOTES_LIST_PATH, JSON.stringify(Parser.Emotes.emotes), (err) => {
                if (!err) {
                  dialog.showMessageBox(MainWindow, {
                    title: 'New Emote Added',
                    type: 'info',
                    message: `Emote ${newEmote} with the index ${index} was successfully added.`,
                    buttons: ['Close']
                  });
                } else {
                  dialog.showMessageBox(MainWindow, {
                    title: 'Could Not Add Emote',
                    type: 'error',
                    message: err,
                    buttons: ['Close']
                  });
                }
              });
            }
          }).catch((err) => {
            if (err) { console.log(`${err}`); }
          });
        }).catch((err) => {
          if (err) { console.log(`${err}`); }
        });
      }
    }, {
      label: 'Delete Emote',
      click: () => {
        Promptr.prompt('Emote to remove').then((emote) => {
          if (emote in Parser.Emotes.emotes) {
            Parser.Emotes.deleteEmoteByName(emote);
            DataHandler.update(EMOTES_LIST_PATH, JSON.stringify(Parser.Emotes.emotes), (err) => {
              if (!err) {
                dialog.showMessageBox(MainWindow, {
                  title: 'Emote Deleted Successfully',
                  type: 'info',
                  message: `Emote ${emote} was successfully deleted.`,
                  buttons: ['Close']
                });
              } else {
                dialog.showMessageBox(MainWindow, {
                  title: 'Could Not Delete Emote',
                  type: 'error',
                  message: err,
                  buttons: ['Close']
                });
              }
            });
          } else {
            dialog.showMessageBox(MainWindow, {
              title: 'Could Not Find Emote',
              type: 'error',
              message: `Emote ${emote} does not exist.`,
              buttons: ['Close']
            });
          }
        });
      }
    }, {
      label: 'List Current Emotes',
      accelerator: 'CommandOrControl+L',
      click: () => {
        dialog.showMessageBoxSync(MainWindow, {
          title: 'Current Emotes',
          type: 'info',
          message: Parser.Emotes.listCurrentEmotes(),
          buttons: ['Close']
        });
      }
    }, {
      type: 'separator'
    },
    {
      label: 'Change Output Directory',
      click: () => {
        const result = dialog.showOpenDialogSync(MainWindow, {
          properties: ['openDirectory']
        });
        if (result !== undefined) {
          DataHandler.update(join(app.getPath('userData'), 'output_dir.txt'), result[0], (err) => {
            if (err) console.error(err);
            else {
              dialog.showMessageBox(MainWindow, {
                message: 'Rebase successful.\nYour new output directory is ' + result[0],
                type: 'info',
                buttons: ['OK']
              });
            }
          });
        }
      }
    }, {
      label: 'See Current Output Directory',
      click: () => {
        dialog.showMessageBox(MainWindow, {
          title: 'Current Output Directory',
          type: 'info',
          message: DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt')),
          buttons: ['OK']
        });
      }
    }]
  },
  {
    label: 'About',
    click: (menuItem, window, event) => {
      dialog.showMessageBox(MainWindow, {
        title: 'About',
        type: 'info',
        icon: './assets/fsnowdin.png',
        message: "Ren'Dot by Falling Snowdin.\nNode.js version: " + process.versions.node + '; ' + 'Electron version: ' + process.versions.electron + '.\nFile bugs here: https://github.com/tghgg/rendot',
        buttons: ['Close']
      });
    }
  },
  {
    label: 'Quit',
    role: 'quit'
  }
];

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(MENU));

  MainWindow = new BrowserWindow(
    {
      width: 800,
      height: 700,
      backgroundColor: '#1d1d1d',
      icon: './assets/icon.ico',
      show: false,
      webPreferences: { nodeIntegration: true },
      enableRemoteModule: false
    }
  );
  MainWindow.loadFile('./src/index.html');

  // Initialize the JSON Emotes list
  if (!DataHandler.existsSync(join(app.getPath('userData'), 'Emotes.json'))) {
    DataHandler.create(join(app.getPath('userData'), 'Emotes.json'), JSON.stringify(Parser.Emotes.DEFAULT_EMOTES), (err) => {
      if (err) {
        dialog.showMessageBox(MainWindow, {
          title: 'Error',
          buttons: ['Close'],
          type: 'error',
          message: 'Could not initialize emote list.'
        });
      }
    });
  } else {
    DataHandler.read(join(app.getPath('userData'), 'Emotes.json'), (err, data) => {
      if (!err && data) {
        Parser.Emotes.emotes = JSON.parse(data);
      } else {
        dialog.showErrorBox('Could Not Read Existing Emote List', `${err}`);
      }
    });
  }

  // Check if the JSON output directory is specified
  if (!DataHandler.existsSync(join(app.getPath('userData'), 'output_dir.txt'))) {
    dialog.showMessageBoxSync(MainWindow, {
      title: "Welcome to Ren'Dot",
      type: 'info',
      buttons: ['OK'],
      message: "Since this is your first time using Ren'Dot, you will need to choose a directory to place your output JSON files (the dialogue files).\nDon't worry, you will need to do this just once."
    });
    const result = dialog.showOpenDialogSync(MainWindow, {
      properties: ['openDirectory']
    });
    if (result !== undefined) {
      DataHandler.update(join(app.getPath('userData'), 'output_dir.txt'), result[0]);
    } else {
      DataHandler.update(join(app.getPath('userData'), 'output_dir.txt'), app.getPath('userData'));
    }
  }

  MainWindow.show();
});

ipcMain.on('started_parsing', (event, data) => {
  // Check if output directory still exists
  const OUTPUT_DIR = DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt'));

  if (!DataHandler.existsSync(OUTPUT_DIR)) {
    dialog.showMessageBoxSync(MainWindow, {
      title: "Can't detect output directory",
      type: 'error',
      buttons: ['OK'],
      message: "Ren'Dot couldn't detect your output directory as it might have been moved elsewhere.\nPlease choose a new directory to store your Ren'Dot scripts."
    });
    const result = dialog.showOpenDialogSync(MainWindow, {
      properties: ['openDirectory']
    });
    if (result !== undefined) {
      DataHandler.updateSync(join(app.getPath('userData'), 'output_dir.txt'), result[0]);
    } else {
      DataHandler.updateSync(join(app.getPath('userData'), 'output_dir.txt'), app.getPath('userData'));
    }
  }

  // Create 2 folders for storing JSON dialogues and text scripts if they don't exist already
  DataHandler.mkDir(join(OUTPUT_DIR, 'JSON Dialogues'), (err) => {
    if (err) dialog.showErrorBox('Error', 'Failed to intialize Text Scripts output directory');
  });
  DataHandler.mkDir(join(OUTPUT_DIR, 'Text Scripts'), (err) => {
    if (err) dialog.showErrorBox('Error', 'Failed to intialize JSON Dialogues output directory');
  });

  let endpath = data.name;
  // Create subfolders if specified with a semicolon in the script name box
  if (data.name.split(';').length > 1) {
    DataHandler.mkDir(join(OUTPUT_DIR, 'Text Scripts', data.name.split(';')[1].trim()), (err) => {
      if (err) dialog.showErrorBox('Error', `${err}\nFailed to create new folder for text script.`);
    });
    DataHandler.mkDir(join(OUTPUT_DIR, 'JSON Dialogues', data.name.split(';')[1].trim()), (err) => {
      if (err) dialog.showErrorBox('Error', `${err}\nFailed to create new folder for JSON Dialogue.`);
    });
    endpath = join(data.name.split(';')[1].trim(), data.name.split(';')[0].trim());
  }

  console.log('Clone the script to Text-Scripts');
  DataHandler.update(join(OUTPUT_DIR, 'Text Scripts', endpath + '.txt'), data.script, (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to save the text script.`);
  });

  console.log('Start the process of parsing script.txt');
  DataHandler.update(join(OUTPUT_DIR, 'JSON Dialogues', endpath + '.json'), JSON.stringify(Parser.parse(data.script)), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to save the JSON dialogue.`);
  });

  console.log('Finish!');
  dialog.showMessageBox(MainWindow, {
    title: 'Finished!',
    type: 'info',
    message: 'Parsing complete.\nYour script has been auto-saved.',
    buttons: ['OK']
  });
});

ipcMain.handle('editor-overwrite-confirmation', async (event) => {
  const result = await dialog.showMessageBox(MainWindow, {
    title: 'Confirmation',
    type: 'question',
    buttons: ['Overwrite', 'Cancel'],
    defaultId: 1,
    message: "Do you want to overwrite the current script?\nYour data will be lost if you haven't saved it."
  });
  return result.response;
});

ipcMain.on('save-script', (event, data) => {
  if (data !== null) {
    let filename = join(DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'Text Scripts', data.name);
    if (data.name.split(';').length > 1) {
      filename = join(DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'Text Scripts', data.name.split(';')[1].trim(), data.name.split(';')[0]);
    }

    dialog.showSaveDialog(MainWindow, {
      title: 'Save Script',
      defaultPath: filename,
      filters: [{
        name: '.txt', extensions: ['txt']
      }]
    }).then((result) => {
      if (result.canceled) return;
      if (extname(result.filePath) !== '.txt') result.filePath += '.txt';
      DataHandler.createTextFile(result.filePath, data.script, (err) => {
        if (err) dialog.showErrorBox('Error', `${err}\nFailed to save the script.`);
        else {
          dialog.showMessageBox({
            message: 'Script saved successfully',
            type: 'info',
            buttons: ['OK']
          });
        }
      });
    });
  } else {
    dialog.showErrorBox('Script Empty', "There's nothing to save.");
  }
});

ipcMain.on('open-script-shortcut', () => {
  MENU[0].submenu[1].click();
});
