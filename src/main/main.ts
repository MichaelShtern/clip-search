/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Tray,
  Menu,
  globalShortcut,
  screen,
  clipboard,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { keyboard, Key } from '@nut-tree/nut-js';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const windowWidth = 512;
const windowHeight = 276;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
keyboard.config.autoDelayMs = 0;

let clipboardText = '';

const maxClipboardTextLength = 500;
const clipboardSampleInterval = 5000;

setInterval(() => {
  if (mainWindow) {
    const text: string = clipboard.readText();

    if (
      text &&
      text.length <= maxClipboardTextLength &&
      clipboardText !== text
    ) {
      clipboardText = text;
      mainWindow?.webContents.send('clipbaord-copy', clipboardText);
    }
  }
}, clipboardSampleInterval);

ipcMain.on('toMain', (_, args) => {
  if (args === 'hide') {
    mainWindow?.minimize();

    // The renderer should have copied the value to clipboard, but that
    // operation may take a few ms
    setTimeout(async () => {
      await keyboard.pressKey(Key.LeftControl, Key.V);
      await keyboard.releaseKey(Key.LeftControl, Key.V);
    }, 10);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createTray = () => {
  tray = new Tray(getAssetPath('./icons/16x16.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      type: 'normal',
      click: () => {
        mainWindow?.close();
      },
    },
  ]);
  tray.setToolTip('Quick Clip');
  tray.setContextMenu(contextMenu);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: windowWidth,
    height: windowHeight,
    useContentSize: true,
    frame: false,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    tray = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    await createWindow();
    createTray();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });

    globalShortcut.register('CommandOrControl+Shift+C', () => {
      const point = screen.getCursorScreenPoint();
      const display = screen.getDisplayNearestPoint(point);

      // Adjust point so that cursor doesn't point directly on search text
      point.x += 5;
      point.y += 10;

      // Adjust point to fit the display wokring area
      // The aroking area is the display size excluding the taskbar below
      if (point.x < display.workArea.x) {
        point.x = display.workArea.x;
      } else if (
        point.x + windowWidth >
        display.workArea.x + display.workArea.width
      ) {
        point.x = display.workArea.x + display.workArea.width - windowWidth;
      }

      if (point.y < display.workArea.y) {
        point.y = display.workArea.y;
      } else if (
        point.y + windowHeight >
        display.workArea.y + display.workArea.height
      ) {
        point.y = display.workArea.y + display.workArea.height - windowHeight;
      }

      mainWindow?.show();

      // setSize has issue with 125% DPI in windows, therefore we prefer using
      // setBounds ot setContentBounds which is more reliable
      mainWindow?.setContentBounds(
        {
          width: windowWidth,
          height: windowHeight,
          x: point.x,
          y: point.y,
        },
        false
      );
    });

    globalShortcut.register('CommandOrControl+Shift+V', () => {
      mainWindow?.minimize();
    });
  })
  .catch(console.log);
