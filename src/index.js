'use strict';
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const { basename, extname, join, dirname } = require('path');

const DataHandler = require('../lib/data.js');
const Parser = require('../lib/parser.js');

let MainWindow;

const MENU = [
  {
    label: 'File',
    submenu: [{
      label: 'Open Script',
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
      click: () => {
        MainWindow.webContents.send('empty-check');
      }
    }, {
      type: 'separator'
    }, {
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
    }]
  },
  {
    label: 'About',
    click: (menuItem, window, event) => {
      dialog.showMessageBox(MainWindow, {
        title: 'About',
        type: 'info',
        // icon: './assets/fsnowdin.png',
        message: "Ren'Dot by Falling Snowdin.\nNode.js version: " + process.versions.node + '; ' + 'Electron version: ' + process.versions.electron + '.\nFile bugs here: https://gitlab.com/tghgg/rendot\nYour files are saved at ' + DataHandler.readSync(join(app.getPath('userData'), 'output_dir.txt')) + '.',
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
      // icon: './assets/icon.ico',
      show: false,
      webPreferences: { nodeIntegration: true },
      enableRemoteModule: false
    }
  );
  MainWindow.loadFile('./src/index.html');

  // Check if the JSON output directory is specified
  if (!DataHandler.existsSync(join(app.getPath('userData'), 'output_dir.txt'))) {
    dialog.showMessageBoxSync(MainWindow, {
      title: "Welcome to Ren'Dot",
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
    buttons: ['Cancel', 'Overwrite'],
    defaultId: 0,
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
