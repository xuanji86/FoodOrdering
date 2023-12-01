const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('node:path')
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 900, webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile("index.html").then(r => {
        console.log("loading successful!" + r)
    })
    // win.webContents.openDevTools()
}
app.whenReady().then(() => {
    ipcMain.on('order', (tableId) => {
        const order = new BrowserWindow({
            width: 1200,
            height: 900, webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
        order.loadFile("order.html").then(r => {
            console.log("loading successful!" + r)
        })
        // order.webContents.openDevTools()
    })
    createWindow()
})
