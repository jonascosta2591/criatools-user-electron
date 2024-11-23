const { app, BrowserWindow, ipcMain } = require("electron");
const remoteMain = require("@electron/remote/main");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const { init_puppeteerChatGPT } = require("./src/main_puppeteerChatGPT.js");
// const {
//   init_puppeteerLeonardoIA,
// } = require("./src/main_puppeteerLeonardoIA.js");

remoteMain.initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: true, // Remove a moldura
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Necessário para que o Node.js funcione no renderer process
      enableRemoteModule: true, // Necessário para usar @electron/remote
    },
    icon: path.join(__dirname, "img/Icone.png"),
  });

  remoteMain.enable(win.webContents);

  win.loadFile("index.html");

  // Verificar por atualizações
  autoUpdater.checkForUpdatesAndNotify();

  ipcMain.on("minimize", (event, data) => {
    win.minimize();
  });
  ipcMain.on("close", (event, data) => {
    win.close();
  });
  ipcMain.on("chatgpt", async (event, data) => {
    await init_puppeteerChatGPT();
    console.log("atualização");
  });
  ipcMain.on("leonardoia", async (event, data) => {
    // await init_puppeteerLeonardoIA();
  });

  ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
  });
}

// Eventos de autoUpdater
autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_downloaded");
});
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
