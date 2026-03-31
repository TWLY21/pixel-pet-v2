const { getCharacterDefinition, getVariantDefinition } = require("../config/characters");
const { pickSpawnX, randomBetween } = require("./movement");
const { scheduleNextSloganTime } = require("./sloganSystem");

function createPetEntity({ type, variantId, existingPets, sceneMetrics, now }) {
  const character = getCharacterDefinition(type);
  const variant = getVariantDefinition(type, variantId);
  const startX = pickSpawnX(existingPets, sceneMetrics);

  return {
    id: `pet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: character.type,
    label: character.label,
    variantId: variant.id,
    variantLabel: variant.label,
    colors: variant.colors,
    sloganPoolId: character.sloganPoolId,
    x: startX,
    y: sceneMetrics.petFloor,
    state: "idle",
    direction: Math.random() < 0.5 ? -1 : 1,
    mood: "calm",
    targetX: startX,
    speed: randomBetween(3, 5),
    nextActionAt: now + randomBetween(1200, 2600),
    bubbleText: "",
    bubbleUntil: 0,
    nextSloganAt: now + randomBetween(2200, 4800),
    isDragging: false,
    animationSeed: randomBetween(1, 9999)
  };
}

module.exports = {
  createPetEntity
};
