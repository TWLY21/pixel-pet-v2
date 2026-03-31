const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pixelPetWorld", {
  getAppData: () => ipcRenderer.invoke("app:get-app-data"),
  getWorldSnapshot: () => ipcRenderer.invoke("world:get-snapshot"),
  addPet: (payload) => ipcRenderer.invoke("world:add-pet", payload),
  removePet: (petId) => ipcRenderer.invoke("world:remove-pet", petId),
  removeAllPets: () => ipcRenderer.invoke("world:remove-all-pets"),
  setPetsVisible: (visible) => ipcRenderer.invoke("world:set-pets-visible", visible),
  setSlogansEnabled: (enabled) => ipcRenderer.invoke("world:set-slogans-enabled", enabled),
  startPetDrag: (petId) => ipcRenderer.invoke("world:start-pet-drag", petId),
  updatePetPosition: (payload) => ipcRenderer.invoke("world:update-pet-position", payload),
  endPetDrag: (petId) => ipcRenderer.invoke("world:end-pet-drag", petId),
  setActiveDisplay: (displayId) => ipcRenderer.invoke("display:set-active-display", displayId),
  openControlPanel: () => ipcRenderer.invoke("window:show-control-panel"),
  hideControlPanel: () => ipcRenderer.invoke("window:hide-control-panel"),
  quitApp: () => ipcRenderer.invoke("app:quit"),
  setOverlayPointerCapture: (shouldCapture) =>
    ipcRenderer.invoke("window:set-overlay-pointer-capture", shouldCapture),
  onWorldUpdated: (callback) => {
    ipcRenderer.on("world:updated", (_event, snapshot) => {
      callback(snapshot);
    });
  }
});
