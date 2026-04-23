let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	minimize: () => electron.ipcRenderer.send("window-minimize"),
	maximize: () => electron.ipcRenderer.send("window-maximize"),
	close: () => electron.ipcRenderer.send("window-close")
});
console.log("MyPlay: Preload script loaded with window controls.");
//#endregion
