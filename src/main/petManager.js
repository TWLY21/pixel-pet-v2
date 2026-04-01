const {
  MAX_PETS,
  MIN_PET_SPACING,
  PET_SIZE_OPTIONS,
  SLOGAN_MAX_DELAY_MS,
  SLOGAN_MIN_DELAY_MS,
  WORLD_SIDE_PADDING,
  WORLD_TICK_MS
} = require("../common/constants");
const { CHARACTER_CATALOG, getCharacterDefinition, getVariantDefinition } = require("../config/characters");
const { getSlogansForPool } = require("../config/slogans");

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scheduleNextSloganTime(now) {
  return now + randomBetween(SLOGAN_MIN_DELAY_MS, SLOGAN_MAX_DELAY_MS);
}

function createPetManager({ sceneMetrics, broadcast }) {
  return new PetManager({ sceneMetrics, broadcast });
}

class PetManager {
  constructor({ sceneMetrics, broadcast }) {
    this.sceneMetrics = sceneMetrics;
    this.broadcast = broadcast;
    this.pets = [];
    this.petsVisible = true;
    this.slogansEnabled = true;
    this.timer = null;
  }

  start() {
    this.stop();
    this.timer = setInterval(() => this.updatePets(), WORLD_TICK_MS);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getCatalog() {
    return CHARACTER_CATALOG;
  }

  getSizeOptions() {
    return PET_SIZE_OPTIONS;
  }

  getMaxPets() {
    return MAX_PETS;
  }

  isDragging() {
    return this.pets.some((pet) => pet.isDragging);
  }

  ensureStarterPet() {
    if (this.pets.length > 0) {
      return;
    }

    this.addPet({ type: "cat", variantId: "orange", sizeId: "small" });
  }

  setSceneMetrics(sceneMetrics) {
    this.sceneMetrics = sceneMetrics;

    for (const pet of this.pets) {
      this.clampPetToScene(pet);
      pet.y = this.sceneMetrics.petFloor;
    }

    this.broadcast();
  }

  getMovementBoundsForSize(sizePx) {
    return {
      minX: WORLD_SIDE_PADDING,
      maxX: Math.max(WORLD_SIDE_PADDING, this.sceneMetrics.width - sizePx - WORLD_SIDE_PADDING)
    };
  }

  getAllPets() {
    return this.pets.map((pet) => ({ ...pet }));
  }

  getSnapshot() {
    const now = Date.now();

    return {
      scene: this.sceneMetrics,
      world: {
        maxPets: MAX_PETS,
        petsVisible: this.petsVisible,
        slogansEnabled: this.slogansEnabled,
        activePetCount: this.pets.length,
        pets: this.pets.map((pet) => ({
          id: pet.id,
          type: pet.type,
          label: pet.label,
          variantId: pet.variantId,
          variantLabel: pet.variantLabel,
          sizeId: pet.sizeId,
          sizePx: pet.sizePx,
          x: pet.x,
          y: pet.y,
          renderX: pet.renderX,
          renderBottom: pet.renderBottom,
          state: pet.state,
          direction: pet.direction,
          mood: pet.mood,
          colors: pet.colors,
          bubbleText: pet.bubbleUntil > now ? pet.bubbleText : "",
          isDragging: pet.isDragging,
          animationSeed: pet.animationSeed
        }))
      }
    };
  }

  addPet(payload = {}) {
    if (this.pets.length >= MAX_PETS) {
      return { ok: false, message: "You can only add up to 3 pets." };
    }

    const character = getCharacterDefinition(payload.type || "cat");
    const variant = getVariantDefinition(character.type, payload.variantId);
    const sizeOption =
      PET_SIZE_OPTIONS.find((option) => option.id === payload.sizeId) || PET_SIZE_OPTIONS[1];
    const x = this.pickSpawnX(sizeOption.pixels);
    const now = Date.now();

    const pet = {
      id: `pet-${now}-${Math.random().toString(36).slice(2, 8)}`,
      type: character.type,
      label: character.label,
      variantId: variant.id,
      variantLabel: variant.label,
      sizeId: sizeOption.id,
      sizePx: sizeOption.pixels,
      x,
      y: this.sceneMetrics.petFloor,
      renderX: x,
      renderBottom: this.sceneMetrics.petFloor,
      state: "idle",
      direction: Math.random() < 0.5 ? -1 : 1,
      mood: "calm",
      targetX: x,
      speed: randomBetween(2, 4),
      nextActionAt: now + randomBetween(1800, 3400),
      bubbleText: "",
      bubbleUntil: 0,
      nextSloganAt: now + randomBetween(2500, 5000),
      isDragging: false,
      colors: variant.colors,
      animationSeed: randomBetween(1, 9999),
      sloganPoolId: character.sloganPoolId
    };

    this.syncRenderMetrics(pet);
    this.pets.push(pet);
    this.broadcast();
    return { ok: true, petId: pet.id };
  }

  removePet(petId) {
    const beforeCount = this.pets.length;
    this.pets = this.pets.filter((pet) => pet.id !== petId);

    if (this.pets.length === beforeCount) {
      return { ok: false, message: "Pet not found." };
    }

    this.broadcast();
    return { ok: true };
  }

  removeAllPets() {
    this.pets = [];
    this.broadcast();
    return { ok: true };
  }

  setPetsVisible(visible) {
    this.petsVisible = Boolean(visible);
    this.broadcast();
    return { ok: true, petsVisible: this.petsVisible };
  }

  setSlogansEnabled(enabled) {
    this.slogansEnabled = Boolean(enabled);
    const now = Date.now();

    for (const pet of this.pets) {
      pet.bubbleText = "";
      pet.bubbleUntil = 0;
      pet.nextSloganAt = now + randomBetween(2500, 5000);
    }

    this.broadcast();
    return { ok: true, slogansEnabled: this.slogansEnabled };
  }

  startPetDrag(petId) {
    const pet = this.pets.find((entry) => entry.id === petId);

    if (!pet) {
      return { ok: false, message: "Pet not found." };
    }

    pet.isDragging = true;
    pet.state = "dragging";
    pet.mood = "focused";
    pet.bubbleText = "";
    pet.bubbleUntil = 0;
    this.broadcast();
    return { ok: true };
  }

  updatePetPosition({ petId, x }) {
    const pet = this.pets.find((entry) => entry.id === petId);

    if (!pet || !pet.isDragging) {
      return { ok: false, message: "Pet is not being dragged." };
    }

    const bounds = this.getMovementBoundsForSize(pet.sizePx);
    pet.x = clamp(Math.round(x), bounds.minX, bounds.maxX);
    pet.targetX = pet.x;
    this.syncRenderMetrics(pet);
    this.broadcast();
    return { ok: true, x: pet.x };
  }

  endPetDrag(petId) {
    const pet = this.pets.find((entry) => entry.id === petId);

    if (!pet) {
      return { ok: false, message: "Pet not found." };
    }

    pet.isDragging = false;
    pet.state = "idle";
    pet.mood = "calm";
    pet.nextActionAt = Date.now() + randomBetween(1200, 2600);
    this.broadcast();
    return { ok: true };
  }

  pokePet(petId) {
    const pet = this.pets.find((entry) => entry.id === petId);

    if (!pet) {
      return { ok: false, message: "Pet not found." };
    }

    const now = Date.now();
    pet.state = "reacting";
    pet.mood = "happy";
    pet.bubbleText = "boop!";
    pet.bubbleUntil = now + 1800;
    pet.nextActionAt = now + 1600;
    pet.nextSloganAt = now + randomBetween(5000, 9000);
    this.broadcast();
    return { ok: true };
  }

  updatePets() {
    const now = Date.now();
    let changed = false;

    for (const pet of this.pets) {
      if (this.updateSinglePet(pet, now)) {
        changed = true;
      }
    }

    if (changed) {
      this.broadcast();
    }
  }

  updateSinglePet(pet, now) {
    let changed = false;

    if (pet.bubbleUntil > 0 && now >= pet.bubbleUntil) {
      pet.bubbleText = "";
      pet.bubbleUntil = 0;
      if (pet.state === "reacting") {
        pet.state = "idle";
      }
      changed = true;
    }

    if (pet.isDragging) {
      return changed;
    }

    if (this.slogansEnabled && !pet.bubbleText && now >= pet.nextSloganAt) {
      const slogans = getSlogansForPool(pet.sloganPoolId);
      pet.bubbleText = slogans[randomBetween(0, slogans.length - 1)];
      pet.bubbleUntil = now + 3200;
      pet.nextSloganAt = scheduleNextSloganTime(now);
      pet.mood = "supportive";
      changed = true;
    }

    if (pet.state === "walking") {
      const distance = pet.targetX - pet.x;
      const step = Math.sign(distance) * Math.min(Math.abs(distance), pet.speed);

      if (step === 0) {
        pet.state = "idle";
        pet.mood = "calm";
        pet.nextActionAt = now + randomBetween(1200, 2600);
        changed = true;
      } else {
        const bounds = this.getMovementBoundsForSize(pet.sizePx);
        const nextX = clamp(pet.x + step, bounds.minX, bounds.maxX);

        if (this.isSpacedEnough(nextX, pet)) {
          pet.x = nextX;
          pet.direction = step >= 0 ? 1 : -1;
          this.syncRenderMetrics(pet);
          changed = true;
        } else {
          pet.state = "idle";
          pet.mood = "patient";
          pet.nextActionAt = now + randomBetween(1400, 2600);
          changed = true;
        }
      }

      return changed;
    }

    if (now >= pet.nextActionAt) {
      pet.targetX = this.chooseWalkTarget(pet);
      pet.direction = pet.targetX >= pet.x ? 1 : -1;
      pet.state = "walking";
      pet.mood = "busy";
      changed = true;
    }

    return changed;
  }

  chooseWalkTarget(pet) {
    const bounds = this.getMovementBoundsForSize(pet.sizePx);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const distance = randomBetween(60, 170);
      const direction =
        pet.x <= bounds.minX + 20 ? 1 : pet.x >= bounds.maxX - 20 ? -1 : Math.random() < 0.5 ? -1 : 1;
      const candidateX = clamp(pet.x + distance * direction, bounds.minX, bounds.maxX);

      if (this.isSpacedEnough(candidateX, pet)) {
        return candidateX;
      }
    }

    return pet.x;
  }

  isSpacedEnough(candidateX, currentPet) {
    return this.pets.every((pet) => {
      if (pet.id === currentPet.id) {
        return true;
      }

      const minGap = Math.max(MIN_PET_SPACING, Math.round((pet.sizePx + currentPet.sizePx) * 0.45));
      return Math.abs(candidateX - pet.x) >= minGap;
    });
  }

  pickSpawnX(sizePx) {
    const bounds = this.getMovementBoundsForSize(sizePx);
    const span = Math.max(1, bounds.maxX - bounds.minX);
    const candidates = 7;
    let bestX = Math.round(bounds.minX + span / 2);
    let bestScore = -1;

    if (this.pets.length === 0) {
      return bestX;
    }

    for (let index = 0; index < candidates; index += 1) {
      const candidateX = Math.round(bounds.minX + (span * index) / (candidates - 1));
      const distanceScore = Math.min(...this.pets.map((pet) => Math.abs(candidateX - pet.x)));
      const centerBias = span / 2 - Math.abs(candidateX - (bounds.minX + span / 2));
      const score = distanceScore + centerBias * 0.12;

      if (score > bestScore) {
        bestScore = score;
        bestX = candidateX;
      }
    }

    return bestX;
  }

  clampPetToScene(pet) {
    const bounds = this.getMovementBoundsForSize(pet.sizePx);
    pet.x = clamp(pet.x, bounds.minX, bounds.maxX);
    pet.targetX = clamp(pet.targetX, bounds.minX, bounds.maxX);
    this.syncRenderMetrics(pet);
  }

  syncRenderMetrics(pet) {
    const bounds = this.getMovementBoundsForSize(pet.sizePx);
    pet.renderX = clamp(pet.x, bounds.minX, bounds.maxX);
    pet.renderBottom = this.sceneMetrics.petFloor;
  }
}

module.exports = {
  createPetManager
};
