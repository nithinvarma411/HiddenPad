const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');

let win;
let isTransparent = false;
let isVisible = true;
let serverProcess = null;

const rawId = machineIdSync({ original: true });
const hashedId = crypto.createHash('sha256').update(rawId).digest('hex');

function startBackend() {
  return new Promise((resolve, reject) => {
    const possiblePaths = [
      path.join(process.resourcesPath, 'server', 'server.js'),
      path.join(process.resourcesPath, 'server', 'server'),
      path.join(__dirname, 'dist', 'main', 'server.js'),
      path.join(__dirname, 'dist', 'main', 'server'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'main', 'server.js'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'main', 'server')
    ];

    let serverPath = null;
    for (const pathToCheck of possiblePaths) {
      if (fs.existsSync(pathToCheck)) {
        serverPath = pathToCheck;
        break;
      }
    }

    if (!serverPath) {
      try {
        if (process.resourcesPath && fs.existsSync(process.resourcesPath)) {
          const serverDir = path.join(process.resourcesPath, 'server');
          if (fs.existsSync(serverDir)) {
            fs.readdirSync(serverDir);
          }
        }
      } catch (err) {}
      reject(new Error('Server file not found'));
      return;
    }

    serverProcess = spawn('node', [serverPath], {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;
    let startupTimeout;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if ((output.includes('App running on port') || 
           output.includes('Server listening') ||
           output.includes('listening on') ||
           output.includes('server started')) && !serverReady) {
        serverReady = true;
        clearTimeout(startupTimeout);
        resolve(serverProcess);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('unable to connect to database') || 
          error.includes('MongooseError')) {}
    });

    serverProcess.on('error', (err) => {
      clearTimeout(startupTimeout);
      reject(err);
    });

    serverProcess.on('spawn', () => {});

    serverProcess.on('close', (code) => {
      if (code !== 0 && !serverReady) {
        clearTimeout(startupTimeout);
        reject(new Error(`Server process exited with code ${code}`));
      }
    });

    startupTimeout = setTimeout(() => {
      if (!serverReady) {
        resolve(serverProcess);
      }
    }, 10000);
  });
}

function startBackendDirect() {
  try {
    const serverPaths = [
      path.join(process.resourcesPath, 'server', 'server'),
      path.join(process.resourcesPath, 'server', 'server.js'),
      path.join(__dirname, 'dist', 'main', 'server'),
      path.join(__dirname, 'dist', 'main', 'server.js'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'main', 'server'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'main', 'server.js')
    ];

    for (const serverPath of serverPaths) {
      if (fs.existsSync(serverPath)) {
        require(serverPath);
        return true;
      }
    }
  } catch (error) {
    return false;
  }
  return false;
}

const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.js');

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
      additionalArguments: [`--device-id=${hashedId}`]
    }
  });

  win.setContentProtection(true);

  if (app.isPackaged) {
    const frontendPaths = [
      path.join(__dirname, 'src', 'rendered', 'dist', 'index.html'),
      path.join(__dirname, 'dist', 'index.html'),
      path.join(__dirname, 'index.html'),
      path.join(process.resourcesPath, 'app.asar', 'src', 'rendered', 'dist', 'index.html')
    ];
    
    let frontendPath = null;
    for (const pathToCheck of frontendPaths) {
      if (fs.existsSync(pathToCheck)) {
        frontendPath = pathToCheck;
        break;
      }
    }
    
    if (frontendPath) {
      win.loadFile(frontendPath);
    } else {
      win.loadURL('data:text/html,<h1>Frontend files not found</h1><p>Check console for details</p>');
    }
  } else {
    win.loadURL('http://localhost:5173');
  }

  ipcMain.handle('get-transparency', () => isTransparent);

  win.on('opacity-changed', () => {
    win.webContents.send('transparency-changed', isTransparent);
  });
};

app.whenReady().then(async () => {
  try {
    const directStartSuccess = startBackendDirect();
    
    if (!directStartSuccess) {
      await startBackend();
    }

    setTimeout(() => {
      createWindow();
    }, 3000);
    
  } catch (error) {
    createWindow();
  }

  globalShortcut.register('Escape', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  });

  globalShortcut.register('CommandOrControl+B', () => {
    if (win) isVisible ? win.hide() : win.show();
    isVisible = !isVisible;
  });

  globalShortcut.register('CommandOrControl+shift+R', () => {
    if (win) win.reload();
  });

  globalShortcut.register('CommandOrControl+T', () => {
    if (win) {
      isTransparent = !isTransparent;
      win.setOpacity(isTransparent ? 0.8 : 1);
      win.webContents.send('transparency-changed', isTransparent);
    }
  });

  let isContentProtected = true;
  globalShortcut.register('CommandOrControl+E', () => {
    if (win) {
      isContentProtected = !isContentProtected;
      win.setContentProtection(isContentProtected);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 3000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});
