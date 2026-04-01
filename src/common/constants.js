const APP_TITLE = "Pixel Desktop Pet World v2";
const MAX_PETS = 3;
const OVERLAY_HEIGHT = 168;
const PANEL_WIDTH = 560;
const PANEL_HEIGHT = 760;
const WORLD_TICK_MS = 100;
const WORLD_SIDE_PADDING = 24;
const MIN_PET_SPACING = 56;
const SCENE_PET_FLOOR = 14;
const SLOGAN_MIN_DELAY_MS = 6000;
const SLOGAN_MAX_DELAY_MS = 11000;

const PET_SIZE_OPTIONS = [
  { id: "tiny", label: "Tiny", pixels: 64 },
  { id: "small", label: "Small", pixels: 84 },
  { id: "medium", label: "Medium", pixels: 104 }
];

module.exports = {
  APP_TITLE,
  MAX_PETS,
  OVERLAY_HEIGHT,
  PANEL_WIDTH,
  PANEL_HEIGHT,
  WORLD_TICK_MS,
  WORLD_SIDE_PADDING,
  MIN_PET_SPACING,
  SCENE_PET_FLOOR,
  SLOGAN_MIN_DELAY_MS,
  SLOGAN_MAX_DELAY_MS,
  PET_SIZE_OPTIONS
};
