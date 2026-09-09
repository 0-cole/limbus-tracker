const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow = null;
let gameRunningLastCheck = false;

const DATA_PATH = path.join(app.getPath('documents'), 'LimbusTrackerSave.json');
const LOG_PATH = path.join(app.getPath('userData'), 'crash.log');

function writeLog(msg) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_PATH, `[${timestamp}] ${msg}\n`);
  } catch(e) {}
}

process.on('uncaughtException', (err) => {
  writeLog(`UNCAUGHT EXCEPTION: ${err.stack || err.message}`);
});
process.on('unhandledRejection', (reason, promise) => {
  writeLog(`UNHANDLED REJECTION: ${reason}`);
});

function loadUserData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
  return {};
}

function saveUserData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save user data:', e);
    return false;
  }
}

function createWindow() {
  const isHidden = process.argv.includes('--hidden');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0a',
    title: 'Limbus Tracker',
    show: !isHidden,
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // In development, load from Vite dev server
  const isDev = !app.isPackaged;
  if (false) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);
}

const { checkForUpdates, dynamicDataPath } = require('./autoUpdater.cjs');
const { checkEnkephalin } = require('./enkephalinNotifier.cjs');

function pollGameStatus() {
  setInterval(() => {
    // 1. Check Enkephalin
    const data = loadUserData();
    checkEnkephalin(data);

    // 2. Check Game Status
    exec('tasklist /FI "IMAGENAME eq LimbusCompany.exe"', (error, stdout) => {
      if (error) return;
      const gameRunningNow = stdout.toLowerCase().includes('limbuscompany.exe');
      
      if (gameRunningNow && !gameRunningLastCheck) {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
      gameRunningLastCheck = gameRunningNow;
    });
  }, 10000); // Check every 10 seconds
}

// IPC handlers for persistent data
ipcMain.handle('load-data', () => {
  return loadUserData();
});

ipcMain.handle('save-data', (_, data) => {
  return saveUserData(data);
});

ipcMain.handle('get-data-path', () => {
  return DATA_PATH;
});

ipcMain.handle('log-error', (_, msg) => {
  writeLog(`REACT ERROR: ${msg}`);
});

ipcMain.handle('load-dynamic-data', () => {
  try {
    if (fs.existsSync(dynamicDataPath)) {
      return JSON.parse(fs.readFileSync(dynamicDataPath, 'utf-8'));
    }
  } catch(e) {}
  return { identities: [], egos: [] };
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.limbustracker.app');
  createWindow();
  pollGameStatus();
  
  // Read base data to pass to auto-updater
  let baseIds = [];
  let baseEgos = [];
  try {
    const baseIdsPath = app.isPackaged ? path.join(process.resourcesPath, 'app.asar', 'src', 'data', 'identities.json') : path.join(__dirname, '..', 'src', 'data', 'identities.json');
    const baseEgosPath = app.isPackaged ? path.join(process.resourcesPath, 'app.asar', 'src', 'data', 'egos.json') : path.join(__dirname, '..', 'src', 'data', 'egos.json');
    baseIds = JSON.parse(fs.readFileSync(baseIdsPath, 'utf-8'));
    baseEgos = JSON.parse(fs.readFileSync(baseEgosPath, 'utf-8'));
  } catch(e) {}

  // Run auto updater in the background without blocking the UI
  checkForUpdates(baseIds, baseEgos).catch(e => console.error(e));
  
  // Set to start with Windows silently
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    args: ['--hidden']
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
