const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

// Single-Instance Lock Protocol
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // A secondary instance was launched while an instance is already active.
  app.whenReady().then(() => {
    let iconPath = path.join(__dirname, '..', 'public', 'icon.png');
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, '..', 'dist', 'icon.png');
    }
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
    }
    const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;

    const response = dialog.showMessageBoxSync({
      type: 'warning',
      icon: icon,
      title: 'Limbus Tracker Already Running',
      message: 'Cannot start app, as there is already a running app, silly! — Kenneth',
      detail: 'An active instance of Limbus Tracker is already running on this workstation (check your taskbar or system tray).\n\nWould you like to switch to the existing window, or close it and launch here?',
      buttons: ['Switch to Existing App', 'Close Other Version & Launch Here', 'Quit'],
      defaultId: 0,
      cancelId: 2,
      noLink: true,
    });

    if (response === 1) {
      // User clicked "Close Other Version & Launch Here"
      try {
        const PID_FILE = path.join(app.getPath('userData'), 'app.pid');
        let killed = false;
        if (fs.existsSync(PID_FILE)) {
          const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
          if (oldPid && oldPid !== process.pid) {
            try {
              process.kill(oldPid, 'SIGKILL');
              killed = true;
            } catch (err) {
              try {
                const { execSync } = require('child_process');
                execSync(`taskkill /F /PID ${oldPid}`, { stdio: 'ignore' });
                killed = true;
              } catch (e) {}
            }
          }
        }
        if (!killed && app.isPackaged) {
          try {
            const { execSync } = require('child_process');
            execSync(`taskkill /F /IM "Limbus Tracker.exe" /FI "PID ne ${process.pid}"`, { stdio: 'ignore' });
          } catch (e) {}
        }
      } catch (e) {
        console.error('Failed to terminate existing instance:', e);
      }

      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 500);
      return;
    }

    app.exit(0);
  });
  return;
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // A secondary launch was attempted: bring the primary window to the foreground
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

let mainWindow = null;
let gameRunningLastCheck = false;
let tray = null;
let isQuitting = false;

function createTray() {
  if (tray) return;
  try {
    let iconPath = path.join(__dirname, '..', 'public', 'icon.png');
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, '..', 'dist', 'icon.png');
    }
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
    }

    if (fs.existsSync(iconPath)) {
      const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
      tray = new Tray(icon);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open Limbus Tracker',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]);
      tray.setToolTip('Limbus Tracker');
      tray.setContextMenu(contextMenu);
      tray.on('double-click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
  } catch (err) {
    writeLog(`Tray creation error: ${err.message}`);
  }
}

function setGameLaunchPreference(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: enabled,
    args: enabled ? ['--hidden'] : []
  });
}

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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // In development, load from Vite dev server
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Close to tray if enabled
  mainWindow.on('close', (e) => {
    const data = loadUserData();
    const closeToTray = data.appSettings?.closeToTray !== false;
    if (!isQuitting && closeToTray) {
      e.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
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
      
      const showWhenGameStarts = data.appSettings?.showWhenGameStarts !== false;
      if (showWhenGameStarts && gameRunningNow && !gameRunningLastCheck) {
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
  const currentDisk = loadUserData();
  const mergedSettings = { ...(currentDisk.appSettings || {}), ...(data.appSettings || {}) };
  return saveUserData({ ...data, appSettings: mergedSettings });
});

ipcMain.handle('wipe-data', () => {
  try {
    if (fs.existsSync(DATA_PATH)) {
      fs.unlinkSync(DATA_PATH);
    }
    return true;
  } catch (e) {
    console.error('Failed to wipe data:', e);
    return false;
  }
});

ipcMain.handle('open-external-url', (_, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('download-update', async (event, url, filename) => {
  const https = require('https');
  const http = require('http');
  const os = require('os');
  const tmpPath = path.join(os.tmpdir(), filename || 'LimbusTrackerUpdate.exe');

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(tmpPath);

    // Follow redirects recursively without closing the write stream
    const doRequest = (reqUrl, depth = 0) => {
      if (depth > 10) { reject('Too many redirects'); return; }
      const proto = reqUrl.startsWith('https') ? https : http;
      proto.get(reqUrl, { headers: { 'User-Agent': 'LimbusTracker-Updater/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
          res.resume(); // Discard body, follow redirect
          doRequest(res.headers.location, depth + 1);
          return;
        }

        if (res.statusCode !== 200) {
          file.close(() => fs.unlink(tmpPath, () => {}));
          reject(`Download failed with status ${res.statusCode}`);
          return;
        }

        const total = parseInt(res.headers['content-length'] || '0', 10);
        let received = 0;

        res.on('data', (chunk) => {
          received += chunk.length;
          if (total > 0) {
            event.sender.send('update-progress', Math.round((received / total) * 100));
          }
        });

        res.pipe(file);

        file.on('finish', () => {
          file.close(() => {
            shell.openPath(tmpPath);
            resolve(tmpPath);
          });
        });

        res.on('error', (err) => {
          file.close(() => fs.unlink(tmpPath, () => {}));
          reject(err.message);
        });
      }).on('error', (err) => {
        file.close(() => fs.unlink(tmpPath, () => {}));
        reject(err.message);
      });
    };

    doRequest(url);
  });
});

ipcMain.handle('get-data-path', () => {
  return DATA_PATH;
});

let savedBoundsBeforeGaster = null;
let crackWindow = null;

ipcMain.handle('start-gaster-fullscreen', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    savedBoundsBeforeGaster = mainWindow.getBounds();
    mainWindow.setFullScreen(true);
    return true;
  }
  return false;
});

ipcMain.handle('trigger-gaster-window-crack', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (!savedBoundsBeforeGaster) {
    savedBoundsBeforeGaster = mainWindow.getBounds();
  }

  const isDev = !app.isPackaged;

  // Create transparent borderless overlay window
  crackWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    }
  });

  const crackUrl = isDev 
    ? 'http://localhost:5173/?mode=gaster_crack' 
    : `file://${path.join(__dirname, '..', 'dist', 'index.html')}?mode=gaster_crack`;

  await crackWindow.loadURL(crackUrl);
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
  crackWindow.show();
});

ipcMain.handle('finish-gaster-window-crack', () => {
  if (crackWindow && !crackWindow.isDestroyed()) {
    crackWindow.close();
    crackWindow = null;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setFullScreen(false);
    if (savedBoundsBeforeGaster) {
      mainWindow.setBounds(savedBoundsBeforeGaster);
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('gaster-sequence-complete');
  }
});

ipcMain.handle('get-system-username', () => {
  try {
    return os.userInfo().username || process.env.USERNAME || 'DANTE';
  } catch (e) {
    return process.env.USERNAME || 'DANTE';
  }
});

ipcMain.handle('log-error', (_, msg) => {
  writeLog(`REACT ERROR: ${msg}`);
});

ipcMain.handle('get-game-launch-preference', () => {
  return loadUserData().appSettings?.showWhenGameStarts !== false;
});

ipcMain.handle('set-game-launch-preference', (_, enabled) => {
  const data = loadUserData();
  const saved = saveUserData({
    ...data,
    appSettings: { ...data.appSettings, showWhenGameStarts: Boolean(enabled) }
  });
  if (saved) setGameLaunchPreference(Boolean(enabled));
  return saved;
});

ipcMain.handle('load-dynamic-data', () => {
  try {
    if (fs.existsSync(dynamicDataPath)) {
      return JSON.parse(fs.readFileSync(dynamicDataPath, 'utf-8'));
    }
  } catch(e) {}
  return { identities: [], egos: [] };
});

function cleanupOldTempInstallers() {
  try {
    const os = require('os');
    const tempDir = os.tmpdir();
    fs.readdir(tempDir, (err, files) => {
      if (err || !files) return;
      files.forEach(file => {
        if (/^Limbus[._-]Tracker[._-]Setup.*\.exe$/i.test(file) || file === 'LimbusTrackerUpdate.exe') {
          const filePath = path.join(tempDir, file);
          fs.unlink(filePath, () => {});
        }
      });
    });
  } catch (e) {}
}

app.whenReady().then(() => {
  cleanupOldTempInstallers();
  app.setAppUserModelId('com.limbustracker.app');
  try {
    const PID_FILE = path.join(app.getPath('userData'), 'app.pid');
    fs.writeFileSync(PID_FILE, String(process.pid), 'utf-8');
  } catch (e) {}

  createWindow();
  createTray();
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

  // A hidden background process is needed to detect the game's launch.
  setGameLaunchPreference(loadUserData().appSettings?.showWhenGameStarts !== false);
});

app.on('before-quit', () => {
  isQuitting = true;
  try {
    const PID_FILE = path.join(app.getPath('userData'), 'app.pid');
    if (fs.existsSync(PID_FILE)) {
      const stored = fs.readFileSync(PID_FILE, 'utf-8').trim();
      if (stored === String(process.pid)) {
        fs.unlinkSync(PID_FILE);
      }
    }
  } catch (e) {}
});

app.on('window-all-closed', () => {
  const data = loadUserData();
  const closeToTray = data.appSettings?.closeToTray !== false;
  if (!closeToTray && process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

