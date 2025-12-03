// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getAllDisplays: () => ipcRenderer.invoke('get-all-displays'),
    getDisplayModes: (displayName: string) => ipcRenderer.invoke('get-display-modes', displayName),
    setDisplayMode: (displayName: string, mode: any) => ipcRenderer.invoke('set-display-mode', displayName, mode),
});
