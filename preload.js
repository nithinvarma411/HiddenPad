const { contextBridge, ipcRenderer } = require('electron');

// Extract the deviceId from process.argv
const deviceIdArg = process.argv.find(arg => arg.startsWith('--device-id='));
const deviceId = deviceIdArg?.split('=')[1] || null;

contextBridge.exposeInMainWorld('electronAPI', {
  getDeviceId: () => deviceId,
  getTransparency: async () => await ipcRenderer.invoke('get-transparency'),
  onTransparencyChanged: (callback) => {
    ipcRenderer.on('transparency-changed', (_event, value) => callback(value));
  }
});

console.log("✅ Preload script running");
