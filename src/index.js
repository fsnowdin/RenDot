const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

const file_handler = require('./lib/data.js');
const parser = require('./lib/parser.js');

let mainWindow;

let init_menu = [
    {
        label: 'File',
    },
	{
		label: 'About',
		click: (menuItem, window, event) => {
			dialog.showMessageBox({
				title: 'About',
				message: "Ren'Dot by Choppa2\nNode.js version: " + process.versions.node + ";" + "Electron version: " + process.versions.electron + ".",
				buttons: ['Close']
			});
		}
	}, 
	{
		label: 'Quit',
		click: () => {
			// Quit app completely instead of minimizing to tray
			app.quit();
		}
	}
];


app.on('ready', () => {
    
    let menu = Menu.buildFromTemplate(init_menu);
    Menu.setApplicationMenu(menu);

    mainWindow = new BrowserWindow(
        {
          width: 800,
          height: 700,
          backgroundColor: '#000',
          show: true,
          webPreferences: { nodeIntegration: true },
          enableRemoteModule: false
        }
    );
    mainWindow.loadFile('./index.html');

});

ipcMain.on('started_parsing', (event, data) => {

    console.log("Clone the script to Text-Scripts");
    file_handler.createTextFile('TextScripts', data.name, data.script, (err) => {
        if (err) {
            dialog.showErrorBox('Error', `${err}\nFailed to save the script.`);
        }
    });

    console.log('Start the process of parsing script.txt');
    let json_dialogue = parser.parse(data.script);
    file_handler.create('../JSON-Dialogues', data.name, json_dialogue, (err) => {
        if (err) {
            dialog.showErrorBox('Error', `${err}\nFailed to save the script.`);
        }
    });

    console.log("Finish!");
    dialog.showMessageBox({
        title: 'Finished!',
        message: 'Finished parsing your script.',
        buttons: ['Close']
    });

});