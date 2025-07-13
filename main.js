const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

let win;
let isTransparent = true;
let isVisible = true;

// ✅ Hash the device ID securely here
const rawId = machineIdSync({ original: true });
const hashedId = crypto.createHash('sha256').update(rawId).digest('hex');

const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log("Resolved preload path:", preloadPath);

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--device-id=${hashedId}`] // ✅ Pass deviceId
    }
  });

  win.setContentProtection(true);
  win.loadURL('http://localhost:5173');
};

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Escape', () => app.quit());

  globalShortcut.register('CommandOrControl+B', () => {
    if (win) isVisible ? win.hide() : win.show();
    isVisible = !isVisible;
  });

  globalShortcut.register('CommandOrControl+R', () => {
    if (win) win.reload();
  });

  globalShortcut.register('CommandOrControl+T', () => {
    if (win) {
      isTransparent = !isTransparent;
      win.setOpacity(isTransparent ? 0.5 : 1);
    }
  });

  let isContentProtected = true;
  globalShortcut.register('CommandOrControl+E', () => {
    if (win) {
      isContentProtected = !isContentProtected;
      win.setContentProtection(isContentProtected);
      console.log(
        isContentProtected
          ? '🛡️ Window is now hidden from screen sharing/recording.'
          : '📽️ Window is now visible in screen sharing/recording.'
      );
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
