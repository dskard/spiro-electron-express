const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Setup logging
// Logs go to developer tools console and a file on disk
const log = require('electron-log');

log.transports.console.level = 'info';
log.transports.file.level = 'info';


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let webServer;
let shuttingDown;

function startExpress() {
    // Create the path of the express server to pass in with the spawn call
    var webServerDirectory = path.join(__dirname, 'app', 'bin', 'www');
    log.info('starting node script: ' + webServerDirectory);

    // May need to change this if node is not in PATH
    var nodePath = "node";

    // Update environment variables
    var env = JSON.parse(JSON.stringify(process.env));

    // Start the node express server
    const spawn = require('child_process').spawn;
    webServer = spawn(nodePath,[webServerDirectory], {
        env : env
    });

    // Check if the server started
    if (!webServer) {
        log.info("couldn't start web server");
        return;
    }

    // Send stdout from child process to log
    webServer.stdout.on('data', function (data) {
        log.info('data: ' + data);
    });

    // Send child process messages to log
    // triggered when child process uses process.send() to send messages.
    webServer.on('message', function (message) {
        log.info(message);
    });

    // Handle closing of the child process
    webServer.on('close', function (code) {
        log.info('child process exited with code ' + code);
        webServer = null;

        // Only restart if killed for a reason...
        if (!shuttingDown) {
            log.info('restarting...');
            startExpress();
        }
    });

    // Send stderr from child process to log
    webServer.stderr.on('data', function (data) {
        log.info('stderr: ' + data);
    });

    // Send errors from child process to log
    // things like:
    // process could not be spawned
    // process could not be killed
    webServer.on('error', function (err) {
        log.info('web server error: ' + err);
    });
} // end startExpress


function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1000,
        height: 630
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

} // end createWindow


// This method will be called when Electron has finished
// initialization and is read to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    shuttingDown = false;
    startExpress();
    createWindow();
});


//app.on("browser-window-created", function(e,window) {
//    window.setMenu(null);
//})


// Called before quitting
// Gives us a chance to shut down the child process
app.on('before-quit', function () {
    log.info('gracefully shutting down...');

    // flag to know that we are shutting down
    shuttingDown = true;

    // kill the web server
    webServer.kill();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


process.on ("SIGINT", function () {
    // graceful shutdown
    log.info('shutting down...');
    process.exit();
});


app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if  (mainWindow === null ) {
        createWindow()
    }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
