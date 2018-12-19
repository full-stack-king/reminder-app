'use strict';

// Modules to control application life and create native browser window
const electron = require('electron');
const { app, ipcMain, BrowserWindow } = electron;
const employeeModel = require('./src/models/employee');
const database = require('./src/database');
let mongoose = require('mongoose');

mongoose.connection.on('connected', function () {
    fetchEmployees();
 });

/* require('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
}) */

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let adminWin;
// defines percentage of app screen size
let progress=70;

function createWindow() {
    // get primary display
    let display = electron.screen.getPrimaryDisplay();
    // const { width, height } = display.workAreaSize;
    // get actual boundaries of the primary screen
    const { width, height } = display.bounds;
    const appWidth = Math.floor(width/100*progress);
    const appHeight = Math.floor(height/100*progress);
    // create new browser window
    const options = {
        width: appWidth,
        height: appHeight,
        // frame: false,
        x: width - appWidth,
        y: height - appHeight,
        resizable: false,
        movable: false,
        /* minimizable: false,
        maximizable: false,
        closable: false, */
        // alwaysOnTop: true,
        // skipTaskbar: true,
    }
    adminWin = new BrowserWindow(options);
    // Hide default app menu
    // win.setMenu(null);

    // load the index.html of the app
    adminWin.loadFile('index.html');

    // open dev tools
    // adminWin.webContents.openDevTools();

    // emitted when the window is closed
    adminWin.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        adminWin = null;
    });

    adminWin.onbeforeunload = (e) => {
        return true;
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
    if (adminWin===null) {
        createWindow();
    }
});

app.on('will-quit', (event) => {
    database.disconnect();
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

async function addEmployeeIfNotExists(event, empObject) {
    console.log('finding employee: ' + empObject.email);
    let emp = await employeeModel.findOneAndUpdate({
        email: empObject.email
    },
    empObject,
    { upsert: true });
    event.sender.send('emp_added', { success: true, message: 'Updated employee successfully!' });
}

function fetchEmployees() {
    console.log('fetching employees')
    employeeModel.find()
    .limit(10)
    .then(empList => {
        console.log('found employees: ' + empList.length)
        console.log(JSON.stringify(empList));
        adminWin.webContents.send('emp_list', { success: true, empList: JSON.stringify(empList) });
    }).catch(err => {
        console.log(err)
        console.log('error finding employee')
        // ipcMain.send('emp_list', { success: false, message: 'Error fetching employees list' });
    })
}

ipcMain.on('frm_add_emp_submit', (event, arg) => {
    console.log('received message');
    console.log({arg});
    if (!arg.email || !arg.elapsed_date_limit) {
        console.log('invalid input');
        event.sender.send('emp_added', { success: false, message: 'Please verify input!' });
        return false;
    }
    addEmployeeIfNotExists(event, arg);
    // event.sender.send('emp_added', 'received: ' + arg);
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
