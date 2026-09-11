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
  getSystemUsername: () => ipcRenderer.invoke('get-system-username'),
  downloadUpdate: (url, filename) => ipcRenderer.invoke('download-update', url, filename),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', (_, pct) => cb(pct)),
  removeUpdateProgress: () => ipcRenderer.removeAllListeners('update-progress'),
  startGasterFullscreen: () => ipcRenderer.invoke('start-gaster-fullscreen'),
  triggerGasterWindowCrack: () => ipcRenderer.invoke('trigger-gaster-window-crack'),
  finishGasterWindowCrack: () => ipcRenderer.invoke('finish-gaster-window-crack'),
  onGasterComplete: (cb) => ipcRenderer.on('gaster-sequence-complete', cb),
  removeGasterComplete: () => ipcRenderer.removeAllListeners('gaster-sequence-complete'),
});
