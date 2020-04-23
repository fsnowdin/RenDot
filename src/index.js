const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const { basename, extname, join, dirname } = require('path');

const file_handler = require('../lib/data.js');
const parser = require('../lib/parser.js');

let mainWindow;

const init_menu = [
  {
    label: 'File',
    submenu: [{
      label: 'Open Script',
      click: () => {
        dialog.showOpenDialog(mainWindow, {
          filters: [{
            name: '.txt', extensions: ['txt']
          }, {
            name: 'All Files', extensions: ['*']
          }],
          properties: ['openFile']
        }).then((file_object) => {
          if (file_object.canceled) return;
          // Set the editor's text to the new script text
          // Set the script name correctly if the user specified a folder the script should be saved in when they wrote it
          let filename = basename(file_object.filePaths[0], extname(file_object.filePaths[0]));
          if (dirname(dirname(file_object.filePaths[0])) === join(file_handler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'Text Scripts')) {
            filename += `; ${basename(dirname(file_object.filePaths[0]))}`;
          }
          mainWindow.webContents.send('open-script', {
            name: filename,
            value: file_handler.readSync(file_object.filePaths[0])
          });
        }, (err) => {
          if (err) dialog.showErrorBox('Error', 'Failed to open new script');
        });
      }
    }, {
      label: 'Save Script',
      click: () => {
        mainWindow.webContents.send('empty-check');
      }
    }]
  },
  {
    label: 'About',
    click: (menuItem, window, event) => {
      dialog.showMessageBox(mainWindow, {
        title: 'About',
        type: 'info',
        message: "Ren'Dot by Choppa2\nNode.js version: " + process.versions.node + '; ' + 'Electron version: ' + process.versions.electron + ".\nFile bugs here: https://github.com/tghgg/RenDot\nYour files are saved at " + file_handler.readSync(join(app.getPath('userData'), 'output_dir.txt')) + ".",
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
  const menu = Menu.buildFromTemplate(init_menu);
  Menu.setApplicationMenu(menu);

  app.allowRendererProcessReuse = true;

  let window_size;
  // Set window size to window size in previous session
  if (file_handler.existsSync(join(app.getPath('userData'), 'window_size.json'))) {
    try {
      window_size = JSON.parse(file_handler.readSync(join(app.getPath('userData'), 'window_size.json')));
    } catch (err) {
      if (err) {
        window_size = {
          "x": 800,
          "y": 700
        }
      }
    }
  } else window_size = {
    "x": 800,
    "y": 700
  }

  mainWindow = new BrowserWindow(
    {
      width: window_size.x,
      height: window_size.y,
      backgroundColor: '#1d1d1d',
      icon: './assets/icon.ico',
      show: false,
      webPreferences: { nodeIntegration: true },
      enableRemoteModule: false
    }
  );
  mainWindow.loadFile('./src/index.html');

  // Check if the JSON output directory is specified
  if (!file_handler.existsSync(join(app.getPath('userData'), 'output_dir.txt'))) {
    dialog.showMessageBoxSync(mainWindow, {
      title: "Welcome to Ren'Dot",
      buttons: ['OK'],
      message: "Since this is your first time using Ren'Dot, you will need to choose a directory to place your output JSON files.\nDon't worry, you will need to do this just once."
    });
    const result = dialog.showOpenDialogSync(mainWindow, {
      properties: ['openDirectory']
    });
    if (result !== undefined) {
      file_handler.createSync(join(app.getPath('userData'), 'output_dir.txt'), result[0]);
    } else {
      file_handler.createSync(join(app.getPath('userData'), 'output_dir.txt'), app.getPath('userData'));
    }
  }

  // Check if output directory still exists
  if (!file_handler.existsSync(file_handler.readSync(join(app.getPath('userData'), 'output_dir.txt')))) {
    dialog.showMessageBoxSync(mainWindow, {
      title: "Can't detect output directory",
      type: 'error',
      buttons: ['OK'],
      message: "Ren'Dot couldn't detect your output directory as it might have been moved elsewhere.\nPlease choose a new directory to store your Ren'Dot scripts."
    });
    const result = dialog.showOpenDialogSync(mainWindow, {
      properties: ['openDirectory']
    });
    if (result !== undefined) {
      file_handler.createSync(join(app.getPath('userData'), 'output_dir.txt'), result[0]);
    } else {
      file_handler.createSync(join(app.getPath('userData'), 'output_dir.txt'), app.getPath('userData'));
    }
  }

  // Create 2 folders for storing JSON dialogues and text scripts if they don't exist already
  file_handler.mkDir(join(file_handler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'JSON Dialogues'), (err) => {
    if (err) dialog.showErrorBox('Error', 'Failed to intialize Text Scripts output directory');
  });
  file_handler.mkDir(join(file_handler.readSync(join(app.getPath('userData'), 'output_dir.txt')), 'Text Scripts'), (err) => {
    if (err) dialog.showErrorBox('Error', 'Failed to intialize JSON Dialogues output directory');
  });

  mainWindow.show();

  // Save current window size on quit so the next time Ren'Dot starts, it will use this window size
  mainWindow.on('close', (event, exitCode) => {
    file_handler.createSync(join(app.getPath('userData'), 'window_size.json'), JSON.stringify({"x": mainWindow.getSize()[0], "y": mainWindow.getSize()[1]}));
    app.quit();
  }); 

});

ipcMain.on('started_parsing', (event, data) => {

  const output_dir = file_handler.readSync(join(app.getPath('userData'), 'output_dir.txt'));

  let endpath = data.name;
  if (data.name.split(';').length > 1) {
    file_handler.mkDir(join(output_dir, 'Text Scripts', data.name.split(';')[1].trim()), (err) => {
      if (err) dialog.showErrorBox('Error', `${err}\nFailed so create new folder for text script.`);
    });
    file_handler.mkDir(join(output_dir, 'JSON Dialogues', data.name.split(';')[1].trim()), (err) => {
      if (err) dialog.showErrorBox('Error', `${err}\nFailed so create new folder for JSON Dialogue.`);
    });
    endpath = join(data.name.split(';')[1].trim(), data.name.split(';')[0].trim());
  }

  console.log('Clone the script to Text-Scripts');
  file_handler.createTextFile(join(output_dir, 'Text Scripts', endpath+'.txt'), data.script, (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to save the text script.`);
  });

  console.log('Start the process of parsing script.txt');
  file_handler.create(join(output_dir, 'JSON Dialogues', endpath+'.json'), parser.parse(data.script), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to save the JSON dialogue.`);
  });

  console.log('Finish!');
  dialog.showMessageBox(mainWindow, {
    title: 'Finished!',
    type: 'info',
    message: 'Parsing complete.\nYour script has been auto-saved.',
    buttons: ['OK']
  });

});

ipcMain.handle('editor-overwrite-confirmation', async (event) => {
  const result = await dialog.showMessageBox(mainWindow, {
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

    let filename = data.name;
    if (data.name.split(';').length > 1) {
      filename = data.name.split(';')[0];
    }

    dialog.showSaveDialog(mainWindow, {
      title: 'Save Script',
      defaultPath: filename,
      filters: [{
        name: '.txt', extensions: ['txt']
      }]
    }).then((result) => {
      if (result.canceled) return;
      if (extname(result.filePath) !== '.txt') result.filePath += '.txt';
      file_handler.createTextFile(result.filePath, data.script, (err) => {
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
