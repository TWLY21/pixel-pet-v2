const path = require("path");
const { app, ipcMain, screen } = require("electron");
const { APP_TITLE } = require("./src/common/constants");
const { createDisplayManager } = require("./src/main/displayManager");
const { createPetManager } = require("./src/main/petManager");
const { createWindowManager } = require("./src/main/windowManager");

let displayManager;
let petManager;
let windowManager;
let isQuitting = false;
let overlayInteractivityTimer = null;
let overlayManualCapture = false;

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

function broadcastWorldState() {
  if (!windowManager) {
    return;
  }

  windowManager.broadcast("world:updated", buildSnapshot());
}

function refreshDisplaySelection() {
  displayManager.refreshActiveDisplay();
  windowManager.applyDisplayBounds();
  petManager.setSceneMetrics(displayManager.getSceneMetrics());
  broadcastWorldState();
}

function shouldCaptureOverlayPointer() {
  if (!windowManager || !petManager) {
    return false;
  }

  if (overlayManualCapture) {
    return true;
  }

  if (petManager.isDragging()) {
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

  if (relativeX >= 10 && relativeX <= 220 && relativeY >= overlayBounds.height - 92) {
    return true;
  }

  return petManager.getAllPets().some((pet) => {
    const hitTop = Math.max(0, overlayBounds.height - pet.renderBottom - pet.sizePx - 30);
    const hitBottom = Math.min(overlayBounds.height, overlayBounds.height - pet.renderBottom + 10);
    return (
      relativeX >= pet.renderX &&
      relativeX <= pet.renderX + pet.sizePx &&
      relativeY >= hitTop &&
      relativeY <= hitBottom
    );
  });
}

function refreshOverlayInteractivity() {
  if (!windowManager) {
    return;
  }

  windowManager.setOverlayPointerCapture(shouldCaptureOverlayPointer());
}

function quitApplication() {
  if (isQuitting) {
    return;
  }

  isQuitting = true;

  clearInterval(overlayInteractivityTimer);

  if (petManager) {
    petManager.stop();
  }

  app.quit();

  setTimeout(() => {
    app.exit(0);
  }, 300);
}

app.whenReady().then(() => {
  displayManager = createDisplayManager({ screen });
  petManager = createPetManager({
    sceneMetrics: displayManager.getSceneMetrics(),
    broadcast: () => {
      refreshOverlayInteractivity();
      broadcastWorldState();
    }
  });
  windowManager = createWindowManager({
    preloadPath: path.join(__dirname, "preload.js"),
    displayManager,
    shouldPreventPanelClose: () => !isQuitting
  });

  petManager.ensureStarterPet();
  petManager.start();
  windowManager.createWindows();
  broadcastWorldState();
  refreshOverlayInteractivity();

  overlayInteractivityTimer = setInterval(refreshOverlayInteractivity, 90);

  screen.on("display-added", refreshDisplaySelection);
  screen.on("display-removed", refreshDisplaySelection);
  screen.on("display-metrics-changed", refreshDisplaySelection);
});

ipcMain.handle("app:get-app-data", () => {
  return {
    title: APP_TITLE,
    maxPets: petManager.getMaxPets(),
    catalog: petManager.getCatalog(),
    sizeOptions: petManager.getSizeOptions()
  };
});

ipcMain.handle("world:get-snapshot", () => buildSnapshot());
ipcMain.handle("world:add-pet", (_event, payload) => petManager.addPet(payload));
ipcMain.handle("world:remove-pet", (_event, petId) => petManager.removePet(petId));
ipcMain.handle("world:remove-all-pets", () => petManager.removeAllPets());
ipcMain.handle("world:set-pets-visible", (_event, visible) => petManager.setPetsVisible(visible));
ipcMain.handle("world:set-slogans-enabled", (_event, enabled) => petManager.setSlogansEnabled(enabled));
ipcMain.handle("world:start-pet-drag", (_event, petId) => petManager.startPetDrag(petId));
ipcMain.handle("world:update-pet-position", (_event, payload) => petManager.updatePetPosition(payload));
ipcMain.handle("world:end-pet-drag", (_event, petId) => petManager.endPetDrag(petId));
ipcMain.handle("world:poke-pet", (_event, petId) => petManager.pokePet(petId));

ipcMain.handle("display:set-active-display", (_event, displayId) => {
  const result = displayManager.setActiveDisplay(displayId);

  if (result.ok) {
    refreshDisplaySelection();
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

ipcMain.handle("window:set-overlay-pointer-capture", (_event, shouldCapture) => {
  overlayManualCapture = Boolean(shouldCapture);
  refreshOverlayInteractivity();
  return { ok: true };
});

ipcMain.handle("app:quit", () => {
  quitApplication();
  return { ok: true };
});

app.on("before-quit", () => {
  isQuitting = true;
  clearInterval(overlayInteractivityTimer);

  if (petManager) {
    petManager.stop();
  }
});

app.on("window-all-closed", () => {
  quitApplication();
});
