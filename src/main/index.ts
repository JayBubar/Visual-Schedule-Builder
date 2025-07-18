import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import Store from 'electron-store'

// Initialize electron store for persistent data
const store = new Store()

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  })
}

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation
      preload: join(__dirname, 'preload.js'), // Preload script for secure IPC
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: join(__dirname, '../../assets/icon.png'), // App icon
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    
    // Focus window on creation
    if (process.env.NODE_ENV === 'development') {
      mainWindow?.webContents.openDevTools()
    }
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
      event.preventDefault()
    }
  })
}

// App event handlers
app.whenReady().then(() => {
  createWindow()
  createMenu()
  setupIPC()

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })
})

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Schedule',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-schedule')
          }
        },
        {
          label: 'Open Schedule',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-open-schedule')
          }
        },
        {
          label: 'Save Schedule',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-schedule')
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-as-schedule')
          }
        },
        { type: 'separator' },
        {
          label: 'Export to PDF',
          click: () => {
            mainWindow?.webContents.send('menu-export-pdf')
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Schedule Builder',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow?.webContents.send('menu-view-builder')
          }
        },
        {
          label: 'Smartboard Display',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow?.webContents.send('menu-view-display')
          }
        },
        {
          label: 'Student Management',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow?.webContents.send('menu-view-management')
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen())
            }
          }
        },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Activity Library',
          click: () => {
            mainWindow?.webContents.send('menu-activity-library')
          }
        },
        {
          label: 'Import Images',
          click: () => {
            mainWindow?.webContents.send('menu-import-images')
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('menu-settings')
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/YOUR_USERNAME/visual-schedule-builder/wiki/User-Guide')
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            mainWindow?.webContents.send('menu-shortcuts')
          }
        },
        { type: 'separator' },
        {
          label: 'Report Bug',
          click: () => {
            shell.openExternal('https://github.com/YOUR_USERNAME/visual-schedule-builder/issues/new?template=bug_report.md')
          }
        },
        {
          label: 'Request Feature',
          click: () => {
            shell.openExternal('https://github.com/YOUR_USERNAME/visual-schedule-builder/issues/new?template=feature_request.md')
          }
        },
        { type: 'separator' },
        {
          label: 'About Visual Schedule Builder',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Visual Schedule Builder',
              message: 'Visual Schedule Builder',
              detail: `Version: ${app.getVersion()}\nA desktop application for creating interactive visual schedules in special education classrooms.\n\nBuilt with Electron and React.\nOpen source under MIT License.`,
              buttons: ['OK']
            })
          }
        }
      ]
    }
  ]

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About Visual Schedule Builder', role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services' },
        { type: 'separator' },
        { label: 'Hide Visual Schedule Builder', accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function setupIPC(): void {
  // Handle data persistence
  ipcMain.handle('store-get', (event, key) => {
    return store.get(key)
  })

  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value)
    return true
  })

  ipcMain.handle('store-delete', (event, key) => {
    store.delete(key)
    return true
  })

  // File operations
  ipcMain.handle('show-save-dialog', async (event, options) => {
    if (!mainWindow) return { canceled: true }
    
    return await dialog.showSaveDialog(mainWindow, {
      title: 'Save Schedule',
      defaultPath: 'schedule.json',
      filters: [
        { name: 'Schedule Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      ...options
    })
  })

  ipcMain.handle('show-open-dialog', async (event, options) => {
    if (!mainWindow) return { canceled: true }
    
    return await dialog.showOpenDialog(mainWindow, {
      title: 'Open Schedule',
      filters: [
        { name: 'Schedule Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile'],
      ...options
    })
  })

  ipcMain.handle('show-open-images-dialog', async () => {
    if (!mainWindow) return { canceled: true }
    
    return await dialog.showOpenDialog(mainWindow, {
      title: 'Import Images',
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections']
    })
  })

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  ipcMain.handle('get-app-path', (event, name) => {
    return app.getPath(name as any)
  })
}
