const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  loadDynamicData: () => ipcRenderer.invoke('load-dynamic-data'),
  logError: (msg) => ipcRenderer.invoke('log-error', msg),
  getGameLaunchPreference: () => ipcRenderer.invoke('get-game-launch-preference'),
  setGameLaunchPreference: (enabled) => ipcRenderer.invoke('set-game-launch-preference', enabled)
});
