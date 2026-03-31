const path = require("path");
const { BrowserWindow } = require("electron");

function createWindowManager({ preloadPath, displayManager, shouldPreventPanelClose }) {
  return new WindowManager({ preloadPath, displayManager, shouldPreventPanelClose });
}

class WindowManager {
  constructor({ preloadPath, displayManager, shouldPreventPanelClose }) {
    this.preloadPath = preloadPath;
    this.displayManager = displayManager;
    this.shouldPreventPanelClose = shouldPreventPanelClose;
    this.overlayWindow = null;
    this.controlPanelWindow = null;
  }

  createWindows() {
    this.overlayWindow = new BrowserWindow({
      ...this.displayManager.getOverlayBounds(),
      frame: false,
      transparent: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      hasShadow: false,
      alwaysOnTop: true,
      backgroundColor: "#00000000",
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    this.overlayWindow.setMenuBarVisibility(false);
    this.overlayWindow.setAlwaysOnTop(true, "screen-saver");
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    this.overlayWindow.loadFile(path.join(process.cwd(), "src", "overlay", "index.html"));

    this.controlPanelWindow = new BrowserWindow({
      ...this.displayManager.getControlPanelBounds(),
      resizable: false,
      minimizable: true,
      maximizable: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      backgroundColor: "#f6f1e8",
      title: "Pixel Desktop Pet World",
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    this.controlPanelWindow.loadFile(path.join(process.cwd(), "src", "control", "index.html"));
    this.controlPanelWindow.on("close", (event) => {
      if (!this.shouldPreventPanelClose()) {
        return;
      }

      event.preventDefault();
      this.controlPanelWindow.hide();
    });
  }

  applyDisplayBounds() {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.setBounds(this.displayManager.getOverlayBounds());
      this.overlayWindow.setAlwaysOnTop(true, "screen-saver");
    }

    if (this.controlPanelWindow && !this.controlPanelWindow.isDestroyed()) {
      this.controlPanelWindow.setBounds(this.displayManager.getControlPanelBounds());
    }
  }

  broadcast(channel, payload) {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send(channel, payload);
    }

    if (this.controlPanelWindow && !this.controlPanelWindow.isDestroyed()) {
      this.controlPanelWindow.webContents.send(channel, payload);
    }
  }

  showControlPanel() {
    if (this.controlPanelWindow && !this.controlPanelWindow.isDestroyed()) {
      this.controlPanelWindow.show();
      this.controlPanelWindow.focus();
    }
  }

  hideControlPanel() {
    if (this.controlPanelWindow && !this.controlPanelWindow.isDestroyed()) {
      this.controlPanelWindow.hide();
    }
  }

  setOverlayPointerCapture(shouldCapture) {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.setIgnoreMouseEvents(!shouldCapture, { forward: true });
    }
  }
}

module.exports = {
  createWindowManager
};
