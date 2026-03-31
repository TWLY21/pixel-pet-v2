const {
  MIN_PET_SPACING,
  PET_SIZE,
  WORLD_SIDE_PADDING
} = require("../common/constants");

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getMovementBounds(sceneMetrics) {
  return {
    minX: WORLD_SIDE_PADDING,
    maxX: Math.max(WORLD_SIDE_PADDING, sceneMetrics.width - PET_SIZE - WORLD_SIDE_PADDING)
  };
}

function isSpacedEnough(candidateX, pets, ignorePetId) {
  return pets.every((pet) => pet.id === ignorePetId || Math.abs(candidateX - pet.x) >= MIN_PET_SPACING);
}

function pickSpawnX(pets, sceneMetrics) {
  const { minX, maxX } = getMovementBounds(sceneMetrics);
  const span = Math.max(1, maxX - minX);
  const candidateCount = 9;
  let bestX = Math.round(minX + span / 2);
  let bestScore = -1;

  // Start the very first pet near the center of the scene so it is easy to see.
  if (pets.length === 0) {
    return bestX;
  }

  for (let index = 0; index < candidateCount; index += 1) {
    const candidateX = Math.round(minX + (span * index) / (candidateCount - 1));
    const distanceScore = Math.min(...pets.map((pet) => Math.abs(pet.x - candidateX)));
    const centerBias = span / 2 - Math.abs(candidateX - (minX + span / 2));
    const score = distanceScore + centerBias * 0.18;

    if (score > bestScore) {
      bestScore = score;
      bestX = candidateX;
    }
  }

  return bestX;
}

function chooseWalkTarget(pet, pets, sceneMetrics) {
  const { minX, maxX } = getMovementBounds(sceneMetrics);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const distance = randomBetween(70, 180);
    const direction = pet.x <= minX + 20 ? 1 : pet.x >= maxX - 20 ? -1 : Math.random() < 0.5 ? -1 : 1;
    const candidateX = clamp(pet.x + distance * direction, minX, maxX);

    if (isSpacedEnough(candidateX, pets, pet.id)) {
      return candidateX;
    }
  }

  return pickSpawnX(
    pets.filter((otherPet) => otherPet.id !== pet.id),
    sceneMetrics
  );
}

function updateWalkingPet({ pet, pets, sceneMetrics }) {
  const distance = pet.targetX - pet.x;
  const direction = distance >= 0 ? 1 : -1;

  if (Math.abs(distance) <= pet.speed) {
    pet.x = pet.targetX;
    return true;
  }

  const { minX, maxX } = getMovementBounds(sceneMetrics);
  const nextX = clamp(pet.x + direction * pet.speed, minX, maxX);

  if (!isSpacedEnough(nextX, pets, pet.id)) {
    return false;
  }

  pet.direction = direction;
  pet.x = nextX;
  return true;
}

module.exports = {
  chooseWalkTarget,
  clamp,
  getMovementBounds,
  pickSpawnX,
  randomBetween,
  updateWalkingPet
};
