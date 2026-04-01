const statusText = document.getElementById("status-text");
const displaySelect = document.getElementById("display-select");
const sloganSelect = document.getElementById("slogan-select");
const typeSelect = document.getElementById("type-select");
const variantSelect = document.getElementById("variant-select");
const sizeSelect = document.getElementById("size-select");
const addPetButton = document.getElementById("add-pet-button");
const toggleVisibilityButton = document.getElementById("toggle-visibility-button");
const hidePanelButton = document.getElementById("hide-panel-button");
const removeAllButton = document.getElementById("remove-all-button");
const quitAppButton = document.getElementById("quit-app-button");
const rosterGrid = document.getElementById("roster-grid");
const activePetsList = document.getElementById("active-pets-list");

const state = {
  appData: null,
  snapshot: null,
  selectedType: "cat",
  selectedVariant: "",
  selectedSize: "small"
};

const renderCache = {
  displaysKey: "",
  statusKey: "",
  rosterKey: "",
  activePetsKey: ""
};

let statusResetTimer = null;

function previewRect(x, y, width, height, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
}

function createPreviewSpriteDataUri(pet) {
  const colors = pet.colors;
  const partsByType = {
    dog: `
      ${previewRect(12, 10, 6, 5, colors.accent)}
      ${previewRect(30, 10, 6, 5, colors.accent)}
      ${previewRect(9, 16, 30, 17, colors.body)}
      ${previewRect(13, 19, 22, 4, "rgba(255,255,255,0.18)")}
      ${previewRect(17, 24, 4, 4, colors.detail)}
      ${previewRect(27, 24, 4, 4, colors.detail)}
      ${previewRect(21, 30, 6, 3, colors.extra)}
      ${previewRect(9, 26, 4, 10, colors.accent)}
      ${previewRect(15, 33, 5, 10, colors.accent)}
      ${previewRect(28, 33, 5, 10, colors.accent)}
      ${previewRect(34, 26, 4, 10, colors.accent)}
    `,
    cat: `
      ${previewRect(14, 9, 5, 6, colors.accent)}
      ${previewRect(29, 9, 5, 6, colors.accent)}
      ${previewRect(12, 16, 24, 16, colors.body)}
      ${previewRect(15, 19, 18, 4, "rgba(255,255,255,0.18)")}
      ${previewRect(17, 24, 4, 4, colors.detail)}
      ${previewRect(27, 24, 4, 4, colors.detail)}
      ${previewRect(20, 29, 8, 3, colors.extra)}
      ${previewRect(14, 33, 5, 9, colors.accent)}
      ${previewRect(29, 33, 5, 9, colors.accent)}
      ${previewRect(36, 24, 4, 13, colors.accent)}
    `,
    demon: `
      ${previewRect(14, 7, 4, 7, colors.accent)}
      ${previewRect(30, 7, 4, 7, colors.accent)}
      ${previewRect(12, 15, 24, 17, colors.body)}
      ${previewRect(15, 18, 18, 4, "rgba(255,255,255,0.12)")}
      ${previewRect(17, 23, 4, 4, colors.detail)}
      ${previewRect(27, 23, 4, 4, colors.detail)}
      ${previewRect(18, 29, 12, 3, colors.extra)}
      ${previewRect(14, 33, 4, 9, colors.accent)}
      ${previewRect(30, 33, 4, 9, colors.accent)}
      ${previewRect(36, 28, 4, 8, colors.accent)}
    `,
    knight: `
      ${previewRect(20, 7, 8, 3, colors.extra)}
      ${previewRect(16, 10, 16, 7, colors.body)}
      ${previewRect(13, 17, 22, 16, colors.body)}
      ${previewRect(16, 20, 16, 4, "rgba(255,255,255,0.18)")}
      ${previewRect(18, 24, 4, 4, colors.detail)}
      ${previewRect(26, 24, 4, 4, colors.detail)}
      ${previewRect(20, 30, 8, 3, colors.accent)}
      ${previewRect(10, 18, 4, 14, colors.extra)}
      ${previewRect(15, 33, 5, 10, colors.accent)}
      ${previewRect(29, 33, 5, 10, colors.accent)}
    `,
    dragon: `
      ${previewRect(7, 17, 7, 12, colors.accent)}
      ${previewRect(34, 17, 7, 12, colors.accent)}
      ${previewRect(13, 12, 21, 20, colors.body)}
      ${previewRect(16, 15, 14, 4, "rgba(255,255,255,0.14)")}
      ${previewRect(18, 22, 4, 4, colors.detail)}
      ${previewRect(27, 22, 4, 4, colors.detail)}
      ${previewRect(21, 28, 7, 3, colors.extra)}
      ${previewRect(13, 33, 5, 9, colors.accent)}
      ${previewRect(27, 33, 5, 9, colors.accent)}
      ${previewRect(34, 27, 8, 6, colors.accent)}
    `
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges">
      <rect width="48" height="48" fill="none" />
      ${partsByType[pet.type] || partsByType.dog}
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function flashStatus(message, durationMs = 2200) {
  clearTimeout(statusResetTimer);
  statusText.textContent = message;
  statusResetTimer = setTimeout(() => renderStatus(), durationMs);
}

function getSelectedCharacter() {
  return state.appData.catalog.find((character) => character.type === state.selectedType);
}

function buildDisplaysKey(snapshot) {
  const displays = snapshot.world.displays
    .map((display) => `${display.id}:${display.width}x${display.height}`)
    .join("|");
  return `${snapshot.world.activeDisplayId}|${snapshot.world.slogansEnabled}|${displays}`;
}

function buildStatusKey(snapshot) {
  const { activePetCount, maxPets, petsVisible, slogansEnabled } = snapshot.world;
  return `${activePetCount}|${maxPets}|${petsVisible}|${slogansEnabled}`;
}

function buildActivePetsKey(snapshot) {
  return snapshot.world.pets
    .map((pet) => [pet.id, pet.type, pet.variantId, pet.sizeId, pet.state, pet.mood].join(":"))
    .join("|");
}

function buildRosterKey() {
  return `${state.selectedType}|${state.selectedVariant}`;
}

function ensureValidSelections() {
  const selectedCharacter = getSelectedCharacter() || state.appData.catalog[0];

  if (!selectedCharacter) {
    return;
  }

  state.selectedType = selectedCharacter.type;

  const hasVariant = selectedCharacter.variants.some((variant) => variant.id === state.selectedVariant);
  if (!hasVariant) {
    state.selectedVariant = selectedCharacter.defaultVariant || selectedCharacter.variants[0].id;
  }

  const hasSize = state.appData.sizeOptions.some((option) => option.id === state.selectedSize);
  if (!hasSize) {
    state.selectedSize = "small";
  }
}

function renderTypeOptions() {
  typeSelect.innerHTML = state.appData.catalog
    .map((character) => `<option value="${character.type}">${character.label}</option>`)
    .join("");
  typeSelect.value = state.selectedType;
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
  variantSelect.value = state.selectedVariant;
}

function renderSizeOptions() {
  sizeSelect.innerHTML = state.appData.sizeOptions
    .map((option) => `<option value="${option.id}">${option.label}</option>`)
    .join("");
  sizeSelect.value = state.selectedSize;
}

function renderDisplayOptions() {
  const nextKey = buildDisplaysKey(state.snapshot);

  if (renderCache.displaysKey === nextKey) {
    return;
  }

  renderCache.displaysKey = nextKey;
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
  sloganSelect.value = state.snapshot.world.slogansEnabled ? "on" : "off";
}

function renderStatus() {
  const nextKey = buildStatusKey(state.snapshot);

  if (renderCache.statusKey === nextKey) {
    return;
  }

  renderCache.statusKey = nextKey;
  const { activePetCount, maxPets, petsVisible, slogansEnabled } = state.snapshot.world;
  statusText.textContent = `${activePetCount} / ${maxPets} pets active`;
  sloganSelect.value = slogansEnabled ? "on" : "off";
  toggleVisibilityButton.textContent = petsVisible ? "Hide Pets" : "Show Pets";
  addPetButton.disabled = activePetCount >= maxPets;
}

function renderRoster() {
  const nextKey = buildRosterKey();

  if (renderCache.rosterKey === nextKey) {
    return;
  }

  renderCache.rosterKey = nextKey;
  rosterGrid.innerHTML = state.appData.catalog
    .map((character) => {
      const isSelected = character.type === state.selectedType;
      const previewVariant =
        character.variants.find((variant) => variant.id === character.defaultVariant) || character.variants[0];
      const previewPet = {
        type: character.type,
        colors: previewVariant.colors
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
}

function renderActivePets() {
  const nextKey = buildActivePetsKey(state.snapshot);

  if (renderCache.activePetsKey === nextKey) {
    return;
  }

  renderCache.activePetsKey = nextKey;
  const pets = state.snapshot.world.pets;

  if (pets.length === 0) {
    activePetsList.innerHTML = `<div class="empty-state">No pets are active yet. Add one above.</div>`;
    return;
  }

  activePetsList.innerHTML = pets
    .map(
      (pet) => `
        <article class="pet-card" data-pet-id="${pet.id}">
          <div class="pet-header">
            <img
              src="${createPreviewSpriteDataUri({ type: pet.type, colors: pet.colors })}"
              alt="${pet.label}"
            />
            <div>
              <p class="section-label">${pet.label}</p>
              <h3>${pet.variantLabel} ${pet.type}</h3>
              <p>Size: ${pet.sizeId}. Mood: ${pet.mood}. State: ${pet.state}.</p>
            </div>
          </div>
          <div class="pet-meta">
            <span class="meta-chip">Size: ${pet.sizeId}</span>
            <span class="meta-chip">Mood: ${pet.mood}</span>
            <span class="meta-chip">State: ${pet.state}</span>
          </div>
          <div class="actions-row">
            <button type="button" data-remove-pet="${pet.id}" class="danger-button">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function syncPanel() {
  if (!state.appData || !state.snapshot) {
    return;
  }

  renderDisplayOptions();
  renderStatus();
  renderRoster();
  renderActivePets();
}

typeSelect.addEventListener("change", () => {
  state.selectedType = typeSelect.value;
  ensureValidSelections();
  renderVariantOptions();
  renderRoster();
});

variantSelect.addEventListener("change", () => {
  state.selectedVariant = variantSelect.value;
});

sizeSelect.addEventListener("change", () => {
  state.selectedSize = sizeSelect.value;
});

displaySelect.addEventListener("change", async () => {
  await window.pixelPetWorld.setActiveDisplay(displaySelect.value);
});

sloganSelect.addEventListener("change", async () => {
  await window.pixelPetWorld.setSlogansEnabled(sloganSelect.value === "on");
});

addPetButton.addEventListener("click", async () => {
  const result = await window.pixelPetWorld.addPet({
    type: state.selectedType,
    variantId: state.selectedVariant,
    sizeId: state.selectedSize
  });

  if (!result?.ok && result?.message) {
    flashStatus(result.message);
  }
});

toggleVisibilityButton.addEventListener("click", async () => {
  await window.pixelPetWorld.setPetsVisible(!state.snapshot.world.petsVisible);
});

hidePanelButton.addEventListener("click", async () => {
  await window.pixelPetWorld.hideControlPanel();
});

removeAllButton.addEventListener("click", async () => {
  await window.pixelPetWorld.removeAllPets();
});

quitAppButton.addEventListener("click", async () => {
  await window.pixelPetWorld.quitApp();
});

rosterGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-character-type]");

  if (!card) {
    return;
  }

  state.selectedType = card.dataset.characterType;
  typeSelect.value = state.selectedType;
  ensureValidSelections();
  renderVariantOptions();
  renderRoster();
});

activePetsList.addEventListener("click", async (event) => {
  const removeButton = event.target.closest("[data-remove-pet]");

  if (!removeButton) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const petId = removeButton.dataset.removePet;
  const result = await window.pixelPetWorld.removePet(petId);

  if (!result?.ok && result?.message) {
    flashStatus(result.message);
    return;
  }

  if (state.snapshot) {
    state.snapshot = {
      ...state.snapshot,
      world: {
        ...state.snapshot.world,
        activePetCount: Math.max(0, state.snapshot.world.activePetCount - 1),
        pets: state.snapshot.world.pets.filter((pet) => pet.id !== petId)
      }
    };
    renderCache.statusKey = "";
    renderCache.activePetsKey = "";
    syncPanel();
  }
});

window.pixelPetWorld.onWorldUpdated((snapshot) => {
  state.snapshot = snapshot;
  syncPanel();
});

state.appData = await window.pixelPetWorld.getAppData();
state.snapshot = await window.pixelPetWorld.getWorldSnapshot();
ensureValidSelections();
renderTypeOptions();
renderVariantOptions();
renderSizeOptions();
syncPanel();
