// ImmoNIQ Desktop — Electron Main Process
// CommonJS, weil package.json "type": "module" ist
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

// In Production: lokal gebaute SPA aus dist/ laden.
// In Dev: optional ENV ELECTRON_DEV_URL setzen für Hot-Reload gegen Vite-Server.
const DEV_URL = process.env.ELECTRON_DEV_URL || "";
const isDev = !!DEV_URL;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#0a0a0a",
    title: "ImmoNIQ",
    icon: path.join(__dirname, "..", "public", "icon-512.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  // Externe Links im Standard-Browser öffnen
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Native Menüleiste (minimal)
  const template = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    {
      label: "Datei",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    {
      label: "Hilfe",
      submenu: [
        {
          label: "ImmoNIQ Support",
          click: () => shell.openExternal("https://immoniq.xyz"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
