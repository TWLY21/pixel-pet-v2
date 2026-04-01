const {
  OVERLAY_HEIGHT,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  SCENE_PET_FLOOR
} = require("../common/constants");

function createDisplayManager({ screen }) {
  return new DisplayManager(screen);
}

class DisplayManager {
  constructor(screen) {
    this.screen = screen;
    this.activeDisplayId = this.screen.getPrimaryDisplay().id;
  }

  refreshActiveDisplay() {
    const displays = this.screen.getAllDisplays();

    if (!displays.some((display) => display.id === this.activeDisplayId)) {
      this.activeDisplayId = this.screen.getPrimaryDisplay().id;
    }
  }

  getActiveDisplayId() {
    this.refreshActiveDisplay();
    return this.activeDisplayId;
  }

  setActiveDisplay(displayId) {
    const nextDisplay = this.screen
      .getAllDisplays()
      .find((display) => String(display.id) === String(displayId));

    if (!nextDisplay) {
      return { ok: false, message: "Display not found." };
    }

    this.activeDisplayId = nextDisplay.id;
    return { ok: true, activeDisplayId: this.activeDisplayId };
  }

  getActiveDisplay() {
    this.refreshActiveDisplay();
    return (
      this.screen.getAllDisplays().find((display) => display.id === this.activeDisplayId) ||
      this.screen.getPrimaryDisplay()
    );
  }

  getDisplayOptions() {
    const primaryDisplay = this.screen.getPrimaryDisplay();

    return this.screen.getAllDisplays().map((display, index) => ({
      id: display.id,
      label: `Display ${index + 1}${display.id === primaryDisplay.id ? " (Primary)" : ""}`,
      width: display.bounds.width,
      height: display.bounds.height
    }));
  }

  getOverlayBounds() {
    const display = this.getActiveDisplay();
    const workArea = display.workArea;
    const fullBounds = display.bounds;

    return {
      x: fullBounds.x,
      y: workArea.y + workArea.height - OVERLAY_HEIGHT,
      width: fullBounds.width,
      height: OVERLAY_HEIGHT
    };
  }

  getControlPanelBounds() {
    const display = this.getActiveDisplay();
    const workArea = display.workArea;
    const width = Math.min(PANEL_WIDTH, Math.max(360, workArea.width - 36));
    const height = Math.min(PANEL_HEIGHT, Math.max(480, workArea.height - 48));

    return {
      width,
      height,
      x: workArea.x + Math.max(0, workArea.width - width - 24),
      y: workArea.y + 24
    };
  }

  getSceneMetrics() {
    const bounds = this.getOverlayBounds();

    return {
      width: bounds.width,
      height: bounds.height,
      petFloor: SCENE_PET_FLOOR
    };
  }
}

module.exports = {
  createDisplayManager
};
