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

  // Inicializar o autoUpdater
  autoUpdater.checkForUpdatesAndNotify();

  // Listeners do autoUpdater
  autoUpdater.on("update-available", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Atualização disponível",
      message:
        "Uma nova versão está disponível. O download será iniciado em breve.",
    });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox(mainWindow, {
        type: "question",
        title: "Atualização pronta",
        message:
          "Uma nova versão foi baixada. Deseja reiniciar o aplicativo para instalar?",
        buttons: ["Sim", "Agora não"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (error) => {
    console.error("Erro durante a atualização:", error);
  });

  ipcMain.on("minimize", (event, data) => {
    win.minimize();
  });
  ipcMain.on("close", (event, data) => {
    win.close();
  });
  ipcMain.on("chatgpt", async (event, data) => {
    await init_puppeteerChatGPT();
    console.log("atualização2");
  });
  ipcMain.on("leonardoia", async (event, data) => {
    // await init_puppeteerLeonardoIA();
  });
}

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
