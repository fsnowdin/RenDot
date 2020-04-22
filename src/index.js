import { app, BrowserWindow } from 'electron';

let mainWindow;

app.on('ready', () => {
    
    mainWindow = new BrowserWindow(
        {
          width: 800,
          height: 400,
          backgroundColor: '#000',
          show: true,
          webPreferences: { nodeIntegration: true },
          enableRemoteModule: false
        }
    );
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    // Listeners

    mainWindow.on('close', () => {
        app.quit();
    })

});
