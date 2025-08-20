import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';

// Development vs Production
const isDev = process.env.NODE_ENV === 'development';

// Global reference to main window
let mainWindow: BrowserWindow | null = null;

// Data directory for storing schedules and settings
// Use different directory for development to avoid conflicts
const dataDir = isDev 
  ? join(homedir(), '.visual-schedule-builder-dev') 
  : join(homedir(), '.visual-schedule-builder');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Create the main application window
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    icon: isDev ? undefined : join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false
    },
    titleBarStyle: 'default',
    autoHideMenuBar: false
  });

  // Load the app
  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Production: load from built files
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Handle window ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Focus the window
      if (isDev) {
        mainWindow.focus();
      }
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external URLs in the default browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = mainWindow?.webContents.getURL();
    
    if (currentUrl && parsedUrl.origin !== new URL(currentUrl).origin) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Schedule',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            sendToRenderer('menu:new-schedule');
          }
        },
        {
          label: 'Open Schedule',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [
                { name: 'Schedule Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ],
              defaultPath: dataDir
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              sendToRenderer('menu:open-schedule', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Save Schedule',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            sendToRenderer('menu:save-schedule');
          }
        },
        {
          label: 'Save Schedule As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              filters: [
                { name: 'Schedule Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ],
              defaultPath: join(dataDir, 'my-schedule.json')
            });
            
            if (!result.canceled && result.filePath) {
              sendToRenderer('menu:save-schedule-as', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Import Activities',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              sendToRenderer('menu:import-activities', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Export Data',
          click: () => {
            sendToRenderer('menu:export-data');
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Schedule Builder',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            sendToRenderer('menu:view-builder');
          }
        },
        {
          label: 'Smartboard Display',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            sendToRenderer('menu:view-display');
          }
        },
        {
          label: 'Student Management',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            sendToRenderer('menu:view-students');
          }
        },
        {
          label: 'Activity Library',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            sendToRenderer('menu:view-library');
          }
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            sendToRenderer('menu:view-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Visual Schedule Builder',
          click: () => {
            sendToRenderer('menu:about');
          }
        },
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/JayBubar/visual-schedule-builder#readme');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/JayBubar/visual-schedule-builder/issues');
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            sendToRenderer('menu:check-updates');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu adjustments for macOS
    (template[4].submenu as Electron.MenuItemConstructorOptions[]).push(
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Helper function to send messages to renderer
function sendToRenderer(channel: string, ...args: any[]): void {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, ...args);
  }
}

// IPC Handlers for data persistence
ipcMain.handle('data:save-schedule', async (event, scheduleData) => {
  try {
    const filePath = join(dataDir, 'current-schedule.json');
    writeFileSync(filePath, JSON.stringify(scheduleData, null, 2));
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('data:load-schedule', async (event, filePath?: string) => {
  try {
    const targetPath = filePath || join(dataDir, 'current-schedule.json');
    
    if (!existsSync(targetPath)) {
      return { success: false, error: 'Schedule file not found' };
    }
    
    const data = readFileSync(targetPath, 'utf-8');
    const scheduleData = JSON.parse(data);
    return { success: true, data: scheduleData };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('data:save-settings', async (event, settings) => {
  try {
    const filePath = join(dataDir, 'settings.json');
    writeFileSync(filePath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('data:load-settings', async () => {
  try {
    const filePath = join(dataDir, 'settings.json');
    
    if (!existsSync(filePath)) {
      // Return default settings
      const defaultSettings = {
        theme: 'dark',
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false
        },
        smartboard: {
          autoAdvance: false,
          showTimer: true,
          soundEffects: true
        }
      };
      return { success: true, data: defaultSettings };
    }
    
    const data = readFileSync(filePath, 'utf-8');
    const settings = JSON.parse(data);
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app:get-data-path', () => {
  return dataDir;
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Export for testing
export { createWindow, createMenu };
