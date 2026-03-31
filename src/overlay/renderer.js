const petLayer = document.getElementById("pet-layer");
const panelButton = document.getElementById("panel-button");
const quitButton = document.getElementById("quit-button");
const debugBadge = document.getElementById("debug-badge");

const viewState = {
  snapshot: null,
  pointerCaptureEnabled: false,
  dragState: null
};

const PET_WIDTH = 92;
const SAFE_LEFT_EDGE = 240;
const SAFE_RIGHT_GAP = 20;
const RENDER_FLOOR = 18;

function rect(x, y, width, height, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
}

function createVisibleSpriteDataUri(pet) {
  const colors = pet.colors;
  const frame = pet.state === "walking" ? Math.floor((Date.now() + pet.animationSeed) / 220) % 2 : 0;
  const tailShift = frame === 0 ? 0 : 1;
  const dogTailY = 18 + tailShift;
  const catTailY = 17 + tailShift;

  const partsByType = {
    dog: `
      ${rect(9, 7, 4, 4, colors.accent)}
      ${rect(19, 7, 4, 4, colors.accent)}
      ${rect(24, dogTailY, 3, 6, colors.accent)}
    `,
    cat: `
      ${rect(10, 7, 4, 4, colors.accent)}
      ${rect(18, 7, 4, 4, colors.accent)}
      ${rect(24, catTailY, 3, 8, colors.accent)}
    `,
    demon: `
      ${rect(10, 6, 3, 5, colors.accent)}
      ${rect(19, 6, 3, 5, colors.accent)}
      ${rect(24, 21, 3, 5, colors.accent)}
    `,
    knight: `
      ${rect(13, 7, 6, 2, colors.extra)}
      ${rect(9, 10, 14, 3, colors.accent)}
      ${rect(6, 14, 2, 12, colors.extra)}
    `,
    dragon: `
      ${rect(6, 12, 4, 7, colors.accent)}
      ${rect(22, 12, 4, 7, colors.accent)}
      ${rect(24, 19, 4, 6, colors.accent)}
    `
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
      <rect width="32" height="32" fill="none" />
      ${partsByType[pet.type] || partsByType.dog}
      ${rect(8, 10, 16, 14, colors.body)}
      ${rect(10, 8, 12, 4, colors.body)}
      ${rect(9, 11, 14, 2, "rgba(255,255,255,0.18)")}
      ${rect(12, 15, 3, 3, colors.detail)}
      ${rect(19, 15, 3, 3, colors.detail)}
      ${rect(14, 20, 6, 2, colors.extra)}
      ${rect(11, 24, 4, 6, colors.accent)}
      ${rect(19, 24, 4, 6, colors.accent)}
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function setPointerCapture(shouldCapture) {
  if (viewState.pointerCaptureEnabled === shouldCapture) {
    return;
  }

  viewState.pointerCaptureEnabled = shouldCapture;
  window.pixelPetWorld.setOverlayPointerCapture(shouldCapture);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSafeRenderX(pet, index, snapshot) {
  const sceneWidth = snapshot?.scene?.width || window.innerWidth;
  const fallbackX = SAFE_LEFT_EDGE + index * 110;
  const requestedX = Number.isFinite(pet.x) ? pet.x : fallbackX;
  const minX = Math.min(SAFE_LEFT_EDGE, Math.max(8, sceneWidth - PET_WIDTH - SAFE_RIGHT_GAP));
  const maxX = Math.max(minX, sceneWidth - PET_WIDTH - SAFE_RIGHT_GAP);
  return clamp(requestedX, minX, maxX);
}

function getRenderBottom(pet) {
  const requestedY = Number.isFinite(pet.y) ? pet.y : 0;
  return Math.max(RENDER_FLOOR, requestedY + RENDER_FLOOR);
}

async function startDrag(button, event) {
  const shell = button.closest(".pet-shell");
  const shellRect = shell.getBoundingClientRect();

  viewState.dragState = {
    petId: button.dataset.petId,
    offsetX: event.clientX - shellRect.left
  };

  setPointerCapture(true);
  await window.pixelPetWorld.startPetDrag(viewState.dragState.petId);
}

async function moveDrag(event) {
  if (!viewState.dragState) {
    return;
  }

  const layerRect = petLayer.getBoundingClientRect();
  const nextX = event.clientX - layerRect.left - viewState.dragState.offsetX;

  await window.pixelPetWorld.updatePetPosition({
    petId: viewState.dragState.petId,
    x: nextX
  });
}

async function endDrag() {
  if (!viewState.dragState) {
    return;
  }

  const petId = viewState.dragState.petId;
  viewState.dragState = null;
  await window.pixelPetWorld.endPetDrag(petId);
  setPointerCapture(false);
}

function bindPetButtons() {
  for (const button of document.querySelectorAll(".pet-hitbox")) {
    button.addEventListener("mousedown", async (event) => {
      event.preventDefault();
      await startDrag(button, event);
    });
  }
}

function render(snapshot) {
  viewState.snapshot = snapshot;
  document.body.dataset.hidden = snapshot.world.petsVisible ? "false" : "true";
  debugBadge.textContent = `overlay alive | pets:${snapshot.world.pets.length} | visible:${snapshot.world.petsVisible}`;

  petLayer.innerHTML = snapshot.world.pets
    .map((pet, index) => {
      const bubbleVisible = Boolean(pet.bubbleText);
      const facing = pet.direction === -1 ? "scaleX(-1)" : "scaleX(1)";
      const renderX = getSafeRenderX(pet, index, snapshot);
      const renderBottom = getRenderBottom(pet);

      return `
        <div class="pet-shell ${pet.isDragging ? "is-dragging" : ""}" style="left:${renderX}px; bottom:${renderBottom}px;">
          <div class="pet-bubble ${bubbleVisible ? "is-visible" : ""}">${pet.bubbleText || ""}</div>
          <button class="pet-hitbox" type="button" data-interactive="true" data-pet-id="${pet.id}" aria-label="Drag ${pet.label}">
            <img class="pet-sprite" src="${createVisibleSpriteDataUri(pet)}" alt="${pet.label}" style="transform:${facing};" />
          </button>
          <div class="pet-label">${pet.label}</div>
        </div>
      `;
    })
    .join("");

  bindPetButtons();
}

window.addEventListener("mousemove", async (event) => {
  if (viewState.dragState) {
    await moveDrag(event);
  }
});

window.addEventListener("mouseup", async () => {
  await endDrag();
});

panelButton.addEventListener("click", async () => {
  await window.pixelPetWorld.openControlPanel();
});

quitButton.addEventListener("click", async () => {
  await window.pixelPetWorld.quitApp();
});

window.pixelPetWorld.onWorldUpdated((snapshot) => {
  render(snapshot);
});

async function initializeOverlay() {
  try {
    const initialSnapshot = await window.pixelPetWorld.getWorldSnapshot();
    render(initialSnapshot);
    setPointerCapture(false);
  } catch (error) {
    debugBadge.textContent = "overlay init failed";
    console.error("Overlay failed to initialize", error);
  }
}

initializeOverlay();
