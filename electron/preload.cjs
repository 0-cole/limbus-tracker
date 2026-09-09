const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  wipeData: () => ipcRenderer.invoke('wipe-data'),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  loadDynamicData: () => ipcRenderer.invoke('load-dynamic-data'),
  logError: (msg) => ipcRenderer.invoke('log-error', msg),
  getGameLaunchPreference: () => ipcRenderer.invoke('get-game-launch-preference'),
  setGameLaunchPreference: (enabled) => ipcRenderer.invoke('set-game-launch-preference', enabled),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  downloadUpdate: (url, filename) => ipcRenderer.invoke('download-update', url, filename),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (_, pct) => cb(pct)),
  removeUpdateProgress: () => ipcRenderer.removeAllListeners('update-progress'),
});
