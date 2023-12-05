const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openOrder: (tableId) => ipcRenderer.send("order", tableId)

})
