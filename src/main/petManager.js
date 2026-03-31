const { MAX_PETS, PET_SIZE, WORLD_TICK_MS } = require("../common/constants");
const { CHARACTER_CATALOG } = require("../config/characters");
const { createPetEntity } = require("./pet");
const {
  chooseWalkTarget,
  clamp,
  getMovementBounds,
  randomBetween,
  updateWalkingPet
} = require("./movement");
const { clearExpiredBubble, setState } = require("./stateMachine");
const { maybeApplySlogan, resetSloganSchedule } = require("./sloganSystem");

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

  getMaxPets() {
    return MAX_PETS;
  }

  ensureStarterPet() {
    if (this.pets.length > 0) {
      return;
    }

    this.addPet({ type: "dog", variantId: "snow" });
  }

  setSceneMetrics(sceneMetrics) {
    this.sceneMetrics = sceneMetrics;
    const { minX, maxX } = getMovementBounds(sceneMetrics);

    for (const pet of this.pets) {
      pet.x = clamp(pet.x, minX, maxX);
      pet.targetX = clamp(pet.targetX, minX, maxX);
      pet.y = sceneMetrics.petFloor;
    }

    this.broadcast();
  }

  getAllPets() {
    return [...this.pets];
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
          variant: pet.variantId,
          variantId: pet.variantId,
          variantLabel: pet.variantLabel,
          x: pet.x,
          y: pet.y,
          state: pet.state,
          direction: pet.direction,
          mood: pet.mood,
          sloganPoolId: pet.sloganPoolId,
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

    const pet = createPetEntity({
      type: payload.type || "dog",
      variantId: payload.variantId,
      existingPets: this.pets,
      sceneMetrics: this.sceneMetrics,
      now: Date.now()
    });

    this.pets.push(pet);
    this.broadcast();
    return { ok: true, petId: pet.id };
  }

  removePet(petId) {
    this.pets = this.pets.filter((pet) => pet.id !== petId);
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
      if (!this.slogansEnabled) {
        pet.bubbleText = "";
        pet.bubbleUntil = 0;
      }

      resetSloganSchedule(pet, now);
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
    pet.mood = "focused";
    setState(pet, "dragging", Date.now());
    this.broadcast();
    return { ok: true };
  }

  updatePetPosition({ petId, x }) {
    const pet = this.pets.find((entry) => entry.id === petId);

    if (!pet || !pet.isDragging) {
      return { ok: false, message: "Pet is not being dragged." };
    }

    const { minX, maxX } = getMovementBounds(this.sceneMetrics);
    pet.x = clamp(Math.round(x), minX, maxX);
    pet.targetX = pet.x;
    this.broadcast();
    return { ok: true, x: pet.x };
  }

  endPetDrag(petId) {
    const pet = this.pets.find((entry) => entry.id === petId);

    if (!pet) {
      return { ok: false, message: "Pet not found." };
    }

    pet.isDragging = false;
    pet.mood = "calm";
    setState(pet, "idle", Date.now());
    this.broadcast();
    return { ok: true };
  }

  updatePets() {
    const now = Date.now();
    let changed = false;

    for (const pet of this.pets) {
      changed = this.updateSinglePet(pet, now) || changed;
    }

    if (changed) {
      this.broadcast();
    }
  }

  updateSinglePet(pet, now) {
    let changed = clearExpiredBubble(pet, now);

    if (pet.isDragging) {
      return changed;
    }

    changed = maybeApplySlogan(pet, now, this.slogansEnabled) || changed;

    if (pet.state === "walking") {
      const moved = updateWalkingPet({
        pet,
        pets: this.pets,
        sceneMetrics: this.sceneMetrics
      });

      if (moved) {
        changed = true;

        if (pet.x === pet.targetX) {
          pet.mood = "calm";
          setState(pet, "idle", now);
        }
      } else {
        pet.mood = "patient";
        setState(pet, "idle", now, {
          nextActionAt: now + randomBetween(800, 1800)
        });
        changed = true;
      }

      return changed;
    }

    if (now >= pet.nextActionAt) {
      pet.targetX = chooseWalkTarget(pet, this.pets, this.sceneMetrics);
      pet.direction = pet.targetX >= pet.x ? 1 : -1;
      pet.mood = "busy";
      setState(pet, "walking", now);
      changed = true;
    }

    return changed;
  }
}

module.exports = {
  createPetManager
};
