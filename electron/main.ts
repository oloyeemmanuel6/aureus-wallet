import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fs from "fs";

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

function getStoragePath() {
  return path.join(app.getPath("userData"), "aureus-vault.json");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0a0a0b",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("storage:read", async () => {
  const file = getStoragePath();
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
});

ipcMain.handle("storage:write", async (_e, data: string) => {
  fs.writeFileSync(getStoragePath(), data, "utf8");
  return true;
});

ipcMain.handle("storage:clear", async () => {
  const file = getStoragePath();
  if (fs.existsSync(file)) fs.unlinkSync(file);
  return true;
});

ipcMain.handle("app:getVersion", () => app.getVersion());

ipcMain.handle("app:getPath", (_e, name: string) => app.getPath(name as any));
