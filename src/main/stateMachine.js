const { randomBetween } = require("./movement");

function setState(pet, state, now, options = {}) {
  pet.state = state;

  if (typeof options.bubbleText === "string") {
    pet.bubbleText = options.bubbleText;
    pet.bubbleUntil = options.bubbleUntil || now + 2200;
  }

  if (typeof options.nextActionAt === "number") {
    pet.nextActionAt = options.nextActionAt;
    return;
  }

  if (state === "dragging") {
    pet.nextActionAt = 0;
    return;
  }

  if (state === "idle") {
    pet.nextActionAt = now + randomBetween(1000, 2400);
  }
}

function clearExpiredBubble(pet, now) {
  if (pet.bubbleUntil > 0 && now >= pet.bubbleUntil) {
    pet.bubbleText = "";
    pet.bubbleUntil = 0;
    return true;
  }

  return false;
}

module.exports = {
  clearExpiredBubble,
  setState
};
