const { contextBridge } = require('electron');

// Extract the deviceId from process.argv
const deviceIdArg = process.argv.find(arg => arg.startsWith('--device-id='));
const deviceId = deviceIdArg?.split('=')[1] || null;

contextBridge.exposeInMainWorld('electronAPI', {
  getDeviceId: () => deviceId
});

console.log("✅ Preload script running");
