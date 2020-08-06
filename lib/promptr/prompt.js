const { BrowserWindow, ipcMain } = require('electron');

const lib = {};

const DEFAULT_CONFIG = {
  width: 300,
  height: 100,
  resizable: false,
  center: true,
  useContentSize: true,
  frame: false,
  backgroundColor: '#0f0f0f',
  show: true,
  webPreferences: { nodeIntegration: true },
  enableRemoteModule: false,
  autoHideMenuBar: true
};

// Receives a listener for the prompt window's ipcRenderer to send the result to
lib.prompt = (question, config = DEFAULT_CONFIG) => {
  if (typeof (config) !== 'object' || typeof (question) !== 'string') return new Error('Invalid input for Promptr');

  config.show = false;

  const PromptWindow = new BrowserWindow(config);
  PromptWindow.loadFile('./lib/promptr/window.html');

  PromptWindow.on('ready-to-show', () => {
    PromptWindow.show();
    PromptWindow.webContents.send('init-question', question);
  });

  return new Promise((resolve, reject) => {
    ipcMain.handleOnce('finished', (event, userInput) => {
      if (userInput) resolve(userInput);
      else reject(Error('The user cancelled the prompt'));
    });
    config.show = true;
  });
};

module.exports = lib;
