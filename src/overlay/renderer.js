const petLayer = document.getElementById("pet-layer");
const panelButton = document.getElementById("panel-button");
const quitButton = document.getElementById("quit-button");

const state = {
  snapshot: null,
  drag: null,
  pendingDrag: null
};

const DRAG_START_DISTANCE = 6;

function rect(x, y, width, height, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
}

function createSpriteDataUri(pet) {
  const colors = pet.colors;
  const frame = pet.state === "walking" ? Math.floor((Date.now() + pet.animationSeed) / 240) % 2 : 0;
  const stepShift = frame === 0 ? 0 : 2;
  const tailShift = frame === 0 ? 0 : 1;

  const partsByType = {
    dog: `
      ${rect(12, 10, 6, 5, colors.accent)}
      ${rect(30, 10, 6, 5, colors.accent)}
      ${rect(9, 16, 30, 17, colors.body)}
      ${rect(13, 19, 22, 4, "rgba(255,255,255,0.18)")}
      ${rect(17, 24, 4, 4, colors.detail)}
      ${rect(27, 24, 4, 4, colors.detail)}
      ${rect(21, 30, 6, 3, colors.extra)}
      ${rect(9, 26 + tailShift, 4, 10, colors.accent)}
      ${rect(15, 33 + stepShift, 5, 10 - stepShift, colors.accent)}
      ${rect(28, 33, 5, 10, colors.accent)}
      ${rect(34, 26, 4, 10, colors.accent)}
    `,
    cat: `
      ${rect(14, 9, 5, 6, colors.accent)}
      ${rect(29, 9, 5, 6, colors.accent)}
      ${rect(12, 16, 24, 16, colors.body)}
      ${rect(15, 19, 18, 4, "rgba(255,255,255,0.18)")}
      ${rect(17, 24, 4, 4, colors.detail)}
      ${rect(27, 24, 4, 4, colors.detail)}
      ${rect(20, 29, 8, 3, colors.extra)}
      ${rect(14, 33 + stepShift, 5, 9 - stepShift, colors.accent)}
      ${rect(29, 33, 5, 9, colors.accent)}
      ${rect(36, 24 + tailShift, 4, 13, colors.accent)}
    `,
    demon: `
      ${rect(14, 7, 4, 7, colors.accent)}
      ${rect(30, 7, 4, 7, colors.accent)}
      ${rect(12, 15, 24, 17, colors.body)}
      ${rect(15, 18, 18, 4, "rgba(255,255,255,0.12)")}
      ${rect(17, 23, 4, 4, colors.detail)}
      ${rect(27, 23, 4, 4, colors.detail)}
      ${rect(18, 29, 12, 3, colors.extra)}
      ${rect(14, 33 + stepShift, 4, 9 - stepShift, colors.accent)}
      ${rect(30, 33, 4, 9, colors.accent)}
      ${rect(36, 28, 4, 8, colors.accent)}
    `,
    knight: `
      ${rect(20, 7, 8, 3, colors.extra)}
      ${rect(16, 10, 16, 7, colors.body)}
      ${rect(13, 17, 22, 16, colors.body)}
      ${rect(16, 20, 16, 4, "rgba(255,255,255,0.18)")}
      ${rect(18, 24, 4, 4, colors.detail)}
      ${rect(26, 24, 4, 4, colors.detail)}
      ${rect(20, 30, 8, 3, colors.accent)}
      ${rect(10, 18, 4, 14, colors.extra)}
      ${rect(15, 33 + stepShift, 5, 10 - stepShift, colors.accent)}
      ${rect(29, 33, 5, 10, colors.accent)}
    `,
    dragon: `
      ${rect(7, 17, 7, 12, colors.accent)}
      ${rect(34, 17, 7, 12, colors.accent)}
      ${rect(13, 12, 21, 20, colors.body)}
      ${rect(16, 15, 14, 4, "rgba(255,255,255,0.14)")}
      ${rect(18, 22, 4, 4, colors.detail)}
      ${rect(27, 22, 4, 4, colors.detail)}
      ${rect(21, 28, 7, 3, colors.extra)}
      ${rect(13, 33 + stepShift, 5, 9 - stepShift, colors.accent)}
      ${rect(27, 33, 5, 9, colors.accent)}
      ${rect(34, 27 + tailShift, 8, 6, colors.accent)}
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

function getPointerX(event) {
  if (typeof event.clientX === "number") {
    return event.clientX;
  }

  return event.touches?.[0]?.clientX ?? 0;
}

function getPointerY(event) {
  if (typeof event.clientY === "number") {
    return event.clientY;
  }

  return event.touches?.[0]?.clientY ?? 0;
}

function handlePointerDown(event) {
  const button = event.target.closest(".pet-hitbox");

  if (!button) {
    return;
  }

  event.preventDefault();

  const shell = button.closest(".pet-shell");
  const shellRect = shell.getBoundingClientRect();
  const pointerX = getPointerX(event);
  const pointerY = getPointerY(event);

  state.pendingDrag = {
    petId: button.dataset.petId,
    offsetX: pointerX - shellRect.left,
    startX: pointerX,
    startY: pointerY
  };
}

async function moveDrag(event) {
  if (state.pendingDrag && !state.drag) {
    const pointerX = getPointerX(event);
    const pointerY = getPointerY(event);
    const travelX = pointerX - state.pendingDrag.startX;
    const travelY = pointerY - state.pendingDrag.startY;
    const distance = Math.hypot(travelX, travelY);

    if (distance >= DRAG_START_DISTANCE) {
      state.drag = {
        petId: state.pendingDrag.petId,
        offsetX: state.pendingDrag.offsetX
      };
      await window.pixelPetWorld.startPetDrag(state.drag.petId);
      await window.pixelPetWorld.setOverlayPointerCapture(true);
    }
  }

  if (!state.drag) {
    return;
  }

  event.preventDefault();
  const layerRect = petLayer.getBoundingClientRect();
  const nextX = getPointerX(event) - layerRect.left - state.drag.offsetX;
  await window.pixelPetWorld.updatePetPosition({
    petId: state.drag.petId,
    x: nextX
  });
}

async function endDrag(event) {
  if (state.pendingDrag && !state.drag) {
    const petId = state.pendingDrag.petId;
    state.pendingDrag = null;
    await window.pixelPetWorld.pokePet(petId);
    return;
  }

  if (!state.drag) {
    return;
  }

  if (event) {
    event.preventDefault();
  }

  const petId = state.drag.petId;
  state.drag = null;
  state.pendingDrag = null;
  await window.pixelPetWorld.endPetDrag(petId);
  await window.pixelPetWorld.setOverlayPointerCapture(false);
}

function render(snapshot) {
  state.snapshot = snapshot;
  document.body.dataset.hidden = snapshot.world.petsVisible ? "false" : "true";

  petLayer.innerHTML = snapshot.world.pets
    .map((pet) => {
      const facing = pet.direction === -1 ? "scaleX(-1)" : "scaleX(1)";
      const bubbleVisible = Boolean(pet.bubbleText);

      return `
        <div
          class="pet-shell ${pet.isDragging ? "is-dragging" : ""}"
          style="--pet-size:${pet.sizePx}px; left:${pet.renderX}px; bottom:${pet.renderBottom}px; width:${pet.sizePx}px; height:${pet.sizePx + 26}px;"
        >
          <div class="pet-bubble ${bubbleVisible ? "is-visible" : ""}">${pet.bubbleText || ""}</div>
          <button
            class="pet-hitbox"
            type="button"
            data-pet-id="${pet.id}"
            style="width:${pet.sizePx}px; height:${pet.sizePx}px;"
            aria-label="Interact with ${pet.label}"
          >
            <img
              class="pet-sprite"
              src="${createSpriteDataUri(pet)}"
              alt="${pet.label}"
              style="width:${pet.sizePx}px; height:${pet.sizePx}px; transform:${facing};"
            />
          </button>
          <div class="pet-label">${pet.label}</div>
        </div>
      `;
    })
    .join("");
}

petLayer.addEventListener("mousedown", handlePointerDown);
petLayer.addEventListener("touchstart", handlePointerDown, { passive: false });
window.addEventListener("mousemove", async (event) => {
  if (state.pendingDrag || state.drag) {
    await moveDrag(event);
  }
});
window.addEventListener("touchmove", async (event) => {
  if (state.pendingDrag || state.drag) {
    await moveDrag(event);
  }
}, { passive: false });
window.addEventListener("mouseup", async (event) => {
  await endDrag(event);
});
window.addEventListener("touchend", async (event) => {
  await endDrag(event);
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

const initialSnapshot = await window.pixelPetWorld.getWorldSnapshot();
render(initialSnapshot);
