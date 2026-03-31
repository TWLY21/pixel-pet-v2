const DEFAULT_SLOGANS = [
  "You're doing great.",
  "Keep going.",
  "Small steps still count.",
  "You've got this."
];

const SLOGAN_POOLS = {
  default: DEFAULT_SLOGANS,
  dog: [
    "You're doing great.",
    "Let's keep going.",
    "One step at a time."
  ],
  cat: [
    "Steady progress is still progress.",
    "You've got this.",
    "A little more and you're there."
  ],
  demon: [
    "No quitting now.",
    "You're stronger than this task.",
    "Keep pushing."
  ],
  knight: [
    "Forward, brave one.",
    "Your effort matters.",
    "Stay steady."
  ],
  dragon: [
    "Breathe fire into the next step.",
    "Big wins start small.",
    "Keep your momentum."
  ]
};

function getSlogansForPool(poolId) {
  return SLOGAN_POOLS[poolId] || SLOGAN_POOLS.default;
}

module.exports = {
  getSlogansForPool
};
