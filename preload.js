const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openOrder: (tableId) => ipcRenderer.send("order", tableId)
  // 除函数之外，我们也可以暴露变量
})
