'use strict';

// Modules to control application life and create native browser window
const electron = require('electron');
const { app, BrowserWindow } = electron;

require('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
})

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // get primary display
    let display = electron.screen.getPrimaryDisplay();
    // const { width, height } = display.workAreaSize;
    // get actual boundaries of the primary screen
    const { width, height } = display.bounds;
    const appWidth = 600;
    const appHeight = 600;
    // create new browser window
    const options = {
        width: appWidth,
        height: appHeight,
        frame: false,
        x: width - 600,
        y: height - 600,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
    }
    win = new BrowserWindow(options);
    // Hide default app menu
    win.setMenu(null);

    // load the index.html of the app
    win.loadFile('index.html');

    // open dev tools
    // win.webContents.openDevTools();

    // emitted when the window is closed
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    win.onbeforeunload = (e) => {
        console.log('I do not want to be closed')
        return false;

        // Unlike usual browsers that a message box will be prompted to users, returning
        // a non-void value will silently cancel the close.
        // It is recommended to use the dialog API to let the user confirm closing the
        // application.
        e.returnValue = false // equivalent to `return false` but not recommended
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    console.log('closed all windows');
    if (process.platform !== 'darwin') {
        // console.log('calling app relaunch');
        // app.relaunch();
        console.log('calling app quit');
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win===null) {
        createWindow();
    }
});

app.on('will-quit', (event) => {
    console.log('app about to quit');
    // event.preventDefault();
});

app.on('quit', (event, exitCode) => {
    console.log('app is quit: ',exitCode);
    // event.preventDefault();
});

app.on('gpu-process-crashed', (event) => {
    console.log('app crashed');
    console.log('relaunch after crash');
    app.relaunch();
    console.log('calling app quit2');
    app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
