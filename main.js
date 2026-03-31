const path = require("path");
const { app, ipcMain, screen } = require("electron");
const { APP_TITLE } = require("./src/common/constants");
const { createDisplayManager } = require("./src/main/displayManager");
const { createWindowManager } = require("./src/main/windowManager");
const { createPetManager } = require("./src/main/petManager");
const { createTrayManager } = require("./src/main/trayManager");

let displayManager;
let windowManager;
let petManager;
let trayManager;
let isQuitting = false;
let overlayManualCapture = false;
let overlayInteractivityTimer = null;

function quitApplication() {
  if (isQuitting) {
    return;
  }

  isQuitting = true;

  if (petManager) {
    petManager.stop();
  }

  if (trayManager) {
    trayManager.destroy();
  }

  app.quit();

  setTimeout(() => {
    app.exit(0);
  }, 250);
}

function buildSnapshot() {
  const snapshot = petManager.getSnapshot();

  return {
    ...snapshot,
    world: {
      ...snapshot.world,
      displays: displayManager.getDisplayOptions(),
      activeDisplayId: displayManager.getActiveDisplayId()
    }
  };
}

function shouldCaptureOverlayPointer() {
  if (!windowManager || !petManager) {
    return false;
  }

  if (overlayManualCapture) {
    return true;
  }

  const overlayBounds = displayManager.getOverlayBounds();
  const cursor = screen.getCursorScreenPoint();

  const relativeX = cursor.x - overlayBounds.x;
  const relativeY = cursor.y - overlayBounds.y;

  if (
    relativeX < 0 ||
    relativeY < 0 ||
    relativeX > overlayBounds.width ||
    relativeY > overlayBounds.height
  ) {
    return false;
  }

  // Bottom-left control pills area.
  if (relativeX >= 8 && relativeX <= 260 && relativeY >= overlayBounds.height - 110) {
    return true;
  }

  // Pet hit areas so pets can be clicked and dragged even while the overlay is click-through.
  for (const pet of petManager.getAllPets()) {
    const hitLeft = pet.x;
    const hitTop = 0;
    const hitWidth = 92;
    const hitHeight = overlayBounds.height - 10;

    if (
      relativeX >= hitLeft &&
      relativeX <= hitLeft + hitWidth &&
      relativeY >= hitTop &&
      relativeY <= hitTop + hitHeight
    ) {
      return true;
    }
  }

  return false;
}

function refreshOverlayInteractivity() {
  if (!windowManager) {
    return;
  }

  windowManager.setOverlayPointerCapture(shouldCaptureOverlayPointer());
}

function broadcastWorldState() {
  if (!windowManager) {
    return;
  }

  windowManager.broadcast("world:updated", buildSnapshot());

  if (trayManager) {
    trayManager.refreshMenu();
  }
}

function syncDisplaySelection() {
  displayManager.refreshActiveDisplay();
  windowManager.applyDisplayBounds();
  petManager.setSceneMetrics(displayManager.getSceneMetrics());
  broadcastWorldState();
}

app.whenReady().then(() => {
  displayManager = createDisplayManager({ screen });
  windowManager = createWindowManager({
    preloadPath: path.join(__dirname, "preload.js"),
    displayManager,
    shouldPreventPanelClose: () => !isQuitting
  });
  petManager = createPetManager({
    sceneMetrics: displayManager.getSceneMetrics(),
    broadcast: broadcastWorldState
  });
  trayManager = createTrayManager({
    appTitle: APP_TITLE,
    getWorldState: () => ({
      petsVisible: petManager.getSnapshot().world.petsVisible
    }),
    actions: {
      showControlPanel: () => windowManager.showControlPanel(),
      togglePetsVisible: () => {
        const petsVisible = petManager.getSnapshot().world.petsVisible;
        petManager.setPetsVisible(!petsVisible);
      },
      quitApp: () => quitApplication()
    }
  });

  petManager.ensureStarterPet();
  petManager.start();
  windowManager.createWindows();
  trayManager.create();
  overlayInteractivityTimer = setInterval(refreshOverlayInteractivity, 80);
  refreshOverlayInteractivity();
  broadcastWorldState();

  screen.on("display-added", syncDisplaySelection);
  screen.on("display-removed", syncDisplaySelection);
  screen.on("display-metrics-changed", syncDisplaySelection);
});

ipcMain.handle("app:get-app-data", () => {
  return {
    title: APP_TITLE,
    maxPets: petManager.getMaxPets(),
    catalog: petManager.getCatalog()
  };
});

ipcMain.handle("world:get-snapshot", () => {
  return buildSnapshot();
});

ipcMain.handle("world:add-pet", (_event, payload) => {
  const result = petManager.addPet(payload);
  refreshOverlayInteractivity();
  return result;
});

ipcMain.handle("world:remove-pet", (_event, petId) => {
  const result = petManager.removePet(petId);
  refreshOverlayInteractivity();
  return result;
});

ipcMain.handle("world:remove-all-pets", () => {
  const result = petManager.removeAllPets();
  refreshOverlayInteractivity();
  return result;
});

ipcMain.handle("world:set-pets-visible", (_event, visible) => {
  return petManager.setPetsVisible(visible);
});

ipcMain.handle("world:set-slogans-enabled", (_event, enabled) => {
  return petManager.setSlogansEnabled(enabled);
});

ipcMain.handle("world:start-pet-drag", (_event, petId) => {
  return petManager.startPetDrag(petId);
});

ipcMain.handle("world:update-pet-position", (_event, payload) => {
  return petManager.updatePetPosition(payload);
});

ipcMain.handle("world:end-pet-drag", (_event, petId) => {
  return petManager.endPetDrag(petId);
});

ipcMain.handle("display:set-active-display", (_event, displayId) => {
  const result = displayManager.setActiveDisplay(displayId);

  if (result.ok) {
    syncDisplaySelection();
  }

  return result;
});

ipcMain.handle("window:show-control-panel", () => {
  windowManager.showControlPanel();
  return { ok: true };
});

ipcMain.handle("window:hide-control-panel", () => {
  windowManager.hideControlPanel();
  return { ok: true };
});

ipcMain.handle("app:quit", () => {
  quitApplication();
  return { ok: true };
});

ipcMain.handle("window:set-overlay-pointer-capture", (_event, shouldCapture) => {
  overlayManualCapture = Boolean(shouldCapture);
  refreshOverlayInteractivity();
  return { ok: true };
});

app.on("before-quit", () => {
  isQuitting = true;

  if (petManager) {
    petManager.stop();
  }

  if (trayManager) {
    trayManager.destroy();
  }

  clearInterval(overlayInteractivityTimer);
});

app.on("window-all-closed", () => {
  quitApplication();
});
