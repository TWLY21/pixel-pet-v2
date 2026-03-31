const statusText = document.getElementById("status-text");
const displaySelect = document.getElementById("display-select");
const sloganSelect = document.getElementById("slogan-select");
const typeSelect = document.getElementById("type-select");
const variantSelect = document.getElementById("variant-select");
const rosterGrid = document.getElementById("roster-grid");
const addPetButton = document.getElementById("add-pet-button");
const toggleVisibilityButton = document.getElementById("toggle-visibility-button");
const hidePanelButton = document.getElementById("hide-panel-button");
const removeAllButton = document.getElementById("remove-all-button");
const quitAppButton = document.getElementById("quit-app-button");
const activePetsList = document.getElementById("active-pets-list");

const state = {
  appData: null,
  snapshot: null,
  initialized: false
};

let statusResetTimer = null;

function previewRect(x, y, width, height, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
}

function createPreviewSpriteDataUri(pet) {
  const colors = pet.colors;
  const partsByType = {
    dog: `
      ${previewRect(9, 7, 4, 4, colors.accent)}
      ${previewRect(19, 7, 4, 4, colors.accent)}
      ${previewRect(24, 18, 3, 6, colors.accent)}
    `,
    cat: `
      ${previewRect(10, 7, 4, 4, colors.accent)}
      ${previewRect(18, 7, 4, 4, colors.accent)}
      ${previewRect(24, 18, 3, 8, colors.accent)}
    `,
    demon: `
      ${previewRect(10, 6, 3, 5, colors.accent)}
      ${previewRect(19, 6, 3, 5, colors.accent)}
      ${previewRect(24, 21, 3, 5, colors.accent)}
    `,
    knight: `
      ${previewRect(13, 7, 6, 2, colors.extra)}
      ${previewRect(9, 10, 14, 3, colors.accent)}
      ${previewRect(6, 14, 2, 12, colors.extra)}
    `,
    dragon: `
      ${previewRect(6, 12, 4, 7, colors.accent)}
      ${previewRect(22, 12, 4, 7, colors.accent)}
      ${previewRect(24, 19, 4, 6, colors.accent)}
    `
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
      <rect width="32" height="32" fill="none" />
      ${partsByType[pet.type] || partsByType.dog}
      ${previewRect(8, 10, 16, 14, colors.body)}
      ${previewRect(10, 8, 12, 4, colors.body)}
      ${previewRect(12, 15, 3, 3, colors.detail)}
      ${previewRect(19, 15, 3, 3, colors.detail)}
      ${previewRect(14, 20, 6, 2, colors.extra)}
      ${previewRect(11, 24, 4, 6, colors.accent)}
      ${previewRect(19, 24, 4, 6, colors.accent)}
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getSelectedCharacter() {
  return state.appData.catalog.find((character) => character.type === typeSelect.value);
}

function renderVariantOptions() {
  const character = getSelectedCharacter();

  if (!character) {
    variantSelect.innerHTML = "";
    return;
  }

  variantSelect.innerHTML = character.variants
    .map((variant) => `<option value="${variant.id}">${variant.label}</option>`)
    .join("");
}

function renderRoster() {
  if (!state.appData) {
    return;
  }

  rosterGrid.innerHTML = state.appData.catalog
    .map((character) => {
      const isSelected = character.type === typeSelect.value;
      const previewVariant =
        character.variants.find((variant) => variant.id === variantSelect.value) ||
        character.variants.find((variant) => variant.id === character.defaultVariant) ||
        character.variants[0];
      const previewPet = {
        type: character.type,
        colors: previewVariant.colors,
        state: "idle",
        direction: 1,
        animationSeed: 0
      };

      return `
        <article class="roster-card ${isSelected ? "is-selected" : ""}" data-character-type="${character.type}">
          <div class="roster-preview">
            <img src="${createPreviewSpriteDataUri(previewPet)}" alt="${character.label}" />
            <div>
              <p class="roster-type">${character.type}</p>
              <h3>${character.label}</h3>
              <p>${character.description}</p>
            </div>
          </div>
          <div class="variant-swatches">
            ${character.variants
              .map(
                (variant) => `
                  <span class="variant-swatch">
                    <span class="swatch-dot" style="background:${variant.colors.body};"></span>
                    ${variant.label}
                  </span>
                `
              )
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");

  for (const card of rosterGrid.querySelectorAll("[data-character-type]")) {
    card.addEventListener("click", () => {
      typeSelect.value = card.dataset.characterType;
      renderVariantOptions();
      renderRoster();
    });
  }
}

function renderTypeOptions() {
  typeSelect.innerHTML = state.appData.catalog
    .map((character) => `<option value="${character.type}">${character.label}</option>`)
    .join("");

  const preferredDefault =
    state.appData.catalog.find((character) => character.type === "cat") ||
    state.appData.catalog[0];
  typeSelect.value = preferredDefault.type;
  renderVariantOptions();
}

function renderDisplayOptions() {
  if (!state.snapshot) {
    return;
  }

  displaySelect.innerHTML = state.snapshot.world.displays
    .map((display) => {
      const isSelected = String(display.id) === String(state.snapshot.world.activeDisplayId);
      return `
        <option value="${display.id}" ${isSelected ? "selected" : ""}>
          ${display.label} - ${display.width}x${display.height}
        </option>
      `;
    })
    .join("");
}

function renderStatus() {
  if (!state.snapshot) {
    return;
  }

  const { activePetCount, maxPets, petsVisible, slogansEnabled } = state.snapshot.world;
  statusText.textContent = `${activePetCount} / ${maxPets} pets active`;
  sloganSelect.value = slogansEnabled ? "on" : "off";
  toggleVisibilityButton.textContent = petsVisible ? "Hide Pets" : "Show Pets";
  addPetButton.disabled = activePetCount >= maxPets;
}

function renderActivePets() {
  if (!state.snapshot) {
    return;
  }

  const pets = state.snapshot.world.pets;

  if (pets.length === 0) {
    activePetsList.innerHTML = `<div class="empty-state">No pets are active yet. Add one above.</div>`;
    return;
  }

  activePetsList.innerHTML = pets
    .map(
      (pet) => `
        <article class="pet-card">
          <div class="pet-header">
            <img src="${createPreviewSpriteDataUri({
              type: pet.type,
              colors: pet.colors,
              state: pet.state,
              direction: pet.direction,
              animationSeed: pet.animationSeed
            })}" alt="${pet.label}" />
            <div>
              <p class="section-label">${pet.label}</p>
              <h3>${pet.variantLabel} ${pet.type}</h3>
              <p>Drag this pet in the desktop scene whenever you want to reposition it.</p>
            </div>
          </div>
          <div class="pet-meta">
            <span class="meta-chip">State: ${pet.state}</span>
            <span class="meta-chip">Mood: ${pet.mood}</span>
            <span class="meta-chip">Variant: ${pet.variantLabel}</span>
          </div>
          <div class="actions-row">
            <button type="button" data-remove-pet="${pet.id}" class="danger-button">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAll() {
  if (!state.appData || !state.snapshot) {
    return;
  }

  renderRoster();
  renderDisplayOptions();
  renderStatus();
  renderActivePets();
}

function flashStatus(message, durationMs = 2200) {
  clearTimeout(statusResetTimer);
  statusText.textContent = message;

  statusResetTimer = setTimeout(() => {
    renderStatus();
  }, durationMs);
}

typeSelect.addEventListener("change", () => {
  renderVariantOptions();
  renderRoster();
});

displaySelect.addEventListener("change", async () => {
  await window.pixelPetWorld.setActiveDisplay(displaySelect.value);
});

sloganSelect.addEventListener("change", async () => {
  await window.pixelPetWorld.setSlogansEnabled(sloganSelect.value === "on");
});

addPetButton.addEventListener("click", async () => {
  const result = await window.pixelPetWorld.addPet({
    type: typeSelect.value,
    variantId: variantSelect.value
  });

  if (!result?.ok && result?.message) {
    flashStatus(result.message);
  }
});

toggleVisibilityButton.addEventListener("click", async () => {
  await window.pixelPetWorld.setPetsVisible(!state.snapshot.world.petsVisible);
});

removeAllButton.addEventListener("click", async () => {
  await window.pixelPetWorld.removeAllPets();
});

hidePanelButton.addEventListener("click", async () => {
  await window.pixelPetWorld.hideControlPanel();
});

quitAppButton.addEventListener("click", async () => {
  await window.pixelPetWorld.quitApp();
});

activePetsList.addEventListener("click", async (event) => {
  const removeButton = event.target.closest("[data-remove-pet]");

  if (!removeButton) {
    return;
  }

  const petId = removeButton.dataset.removePet;
  const result = await window.pixelPetWorld.removePet(petId);

  if (!result?.ok && result?.message) {
    flashStatus(result.message);
  }
});

window.pixelPetWorld.onWorldUpdated((snapshot) => {
  state.snapshot = snapshot;

  if (state.initialized) {
    renderAll();
  }
});

try {
  state.appData = await window.pixelPetWorld.getAppData();
  state.snapshot = await window.pixelPetWorld.getWorldSnapshot();
  state.initialized = true;

  renderTypeOptions();
  renderAll();
} catch (error) {
  statusText.textContent = "Failed to load panel data.";
  console.error("Control panel failed to initialize", error);
}
