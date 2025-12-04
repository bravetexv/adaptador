"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getAllDisplays: () => electron_1.ipcRenderer.invoke('get-all-displays'),
    getDisplayModes: (displayName) => electron_1.ipcRenderer.invoke('get-display-modes', displayName),
    setDisplayMode: (displayName, mode) => electron_1.ipcRenderer.invoke('set-display-mode', displayName, mode),
});
