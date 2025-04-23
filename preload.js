const { contextBridge, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openRDP: (host) => {
    // Use direct command execution instead of shell.openExternal
    const { exec } = require('child_process');
    exec(`mstsc.exe /v:${host}`);
  }
});