const { Menu, Tray, nativeImage } = require("electron");

function createTrayManager({ appTitle, actions, getWorldState }) {
  return new TrayManager({ appTitle, actions, getWorldState });
}

class TrayManager {
  constructor({ appTitle, actions, getWorldState }) {
    this.appTitle = appTitle;
    this.actions = actions;
    this.getWorldState = getWorldState;
    this.tray = null;
  }

  create() {
    const icon = this.buildTrayIcon();
    this.tray = new Tray(icon);
    this.tray.setToolTip(this.appTitle);
    this.tray.on("click", () => {
      this.actions.showControlPanel();
    });
    this.refreshMenu();
  }

  refreshMenu() {
    if (!this.tray) {
      return;
    }

    const worldState = this.getWorldState();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open Control Panel",
        click: () => this.actions.showControlPanel()
      },
      {
        label: worldState.petsVisible ? "Hide Pets" : "Show Pets",
        click: () => this.actions.togglePetsVisible()
      },
      {
        label: "Quit Pixel Desktop Pet World",
        click: () => this.actions.quitApp()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  buildTrayIcon() {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <rect width="16" height="16" rx="4" fill="#233150"/>
        <rect x="3" y="5" width="10" height="7" rx="2" fill="#f4d77a"/>
        <rect x="5" y="3" width="2" height="3" fill="#f4d77a"/>
        <rect x="9" y="3" width="2" height="3" fill="#f4d77a"/>
        <rect x="5" y="7" width="1.5" height="1.5" fill="#233150"/>
        <rect x="9.5" y="7" width="1.5" height="1.5" fill="#233150"/>
        <rect x="6" y="10" width="4" height="1" fill="#d96a62"/>
      </svg>
    `;

    return nativeImage.createFromDataURL(
      `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
    );
  }
}

module.exports = {
  createTrayManager
};
