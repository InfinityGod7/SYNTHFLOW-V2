/**
 * SynthFlow Electron Main Process
 * Reference for local deployment
 */
import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'SynthFlow Desktop',
    backgroundColor: '#050505',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Allow microphone access
  win.webContents.session.setPermissionCheckHandler((_webContents, permission) => {
    return permission === 'media' || permission === 'microphone';
  });

  win.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'media' || permission === 'microphone');
  });

  // Remove menu bar
  win.setMenuBarVisibility(false);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    // In production, load the built files
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Global Push-to-Talk Hotkey
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    win.webContents.send('hotkey-triggered', 'down');
  });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
