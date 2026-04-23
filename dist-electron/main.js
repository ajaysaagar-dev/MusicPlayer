//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
node_path = __toESM(node_path, 1);
let node_url = require("node:url");
//#region electron/main.ts
var __dirname$1 = node_path.default.dirname((0, node_url.fileURLToPath)({}.url));
electron.app.commandLine.appendSwitch("enable-gpu-rasterization");
electron.app.commandLine.appendSwitch("enable-zero-copy");
var mainWindow = null;
function createWindow() {
	const { width: screenWidth, height: screenHeight } = electron.screen.getPrimaryDisplay().workAreaSize;
	const winWidth = Math.floor(screenWidth * .9);
	const winHeight = Math.floor(screenHeight * .9);
	mainWindow = new electron.BrowserWindow({
		width: winWidth,
		height: winHeight,
		x: Math.floor((screenWidth - winWidth) / 2),
		y: Math.floor((screenHeight - winHeight) / 2),
		frame: false,
		resizable: false,
		maximizable: false,
		backgroundColor: "#000000",
		webPreferences: {
			preload: node_path.default.join(__dirname$1, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
			spellcheck: false
		}
	});
	mainWindow.setMenuBarVisibility(false);
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(node_path.default.join(process.env.DIST, "index.html"));
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https:")) electron.shell.openExternal(url);
		return { action: "deny" };
	});
}
electron.ipcMain.on("window-minimize", () => {
	mainWindow?.minimize();
});
electron.ipcMain.on("window-close", () => {
	mainWindow?.close();
});
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
