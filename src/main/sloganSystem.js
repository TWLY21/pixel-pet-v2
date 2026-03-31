const {
  SLOGAN_MAX_DELAY_MS,
  SLOGAN_MIN_DELAY_MS
} = require("../common/constants");
const { getSlogansForPool } = require("../config/slogans");
const { randomBetween } = require("./movement");

function scheduleNextSloganTime(now) {
  return now + randomBetween(SLOGAN_MIN_DELAY_MS, SLOGAN_MAX_DELAY_MS);
}

function maybeApplySlogan(pet, now, slogansEnabled) {
  if (!slogansEnabled || pet.isDragging || now < pet.nextSloganAt || pet.bubbleText) {
    return false;
  }

  const slogans = getSlogansForPool(pet.sloganPoolId);
  const nextText = slogans[randomBetween(0, slogans.length - 1)];
  pet.bubbleText = nextText;
  pet.bubbleUntil = now + 3800;
  pet.nextSloganAt = scheduleNextSloganTime(now);
  pet.mood = "supportive";
  return true;
}

function resetSloganSchedule(pet, now) {
  pet.nextSloganAt = scheduleNextSloganTime(now);
}

module.exports = {
  maybeApplySlogan,
  resetSloganSchedule,
  scheduleNextSloganTime
};
