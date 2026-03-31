function rect(x, y, width, height, fill) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`;
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, value));
}

function adjustColor(hex, amount) {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  const nextRed = clampChannel(red + amount).toString(16).padStart(2, "0");
  const nextGreen = clampChannel(green + amount).toString(16).padStart(2, "0");
  const nextBlue = clampChannel(blue + amount).toString(16).padStart(2, "0");

  return `#${nextRed}${nextGreen}${nextBlue}`;
}

function createPalette(colors) {
  return {
    outline: adjustColor(colors.detail, -22),
    detail: colors.detail,
    body: colors.body,
    bodyShadow: adjustColor(colors.body, -22),
    bodyHighlight: adjustColor(colors.body, 18),
    accent: colors.accent,
    accentShadow: adjustColor(colors.accent, -18),
    extra: colors.extra,
    extraShadow: adjustColor(colors.extra, -18),
    light: adjustColor(colors.extra, 24)
  };
}

function buildEyes(palette) {
  return `
    ${rect(17, 17, 3, 3, palette.detail)}
    ${rect(28, 17, 3, 3, palette.detail)}
    ${rect(18, 17, 1, 1, palette.light)}
    ${rect(29, 17, 1, 1, palette.light)}
  `;
}

function buildDog(frame, palette) {
  const tailX = frame === 0 ? 35 : 36;
  const frontLegY = frame === 0 ? 32 : 31;
  const backLegY = frame === 0 ? 31 : 32;

  return `
    ${rect(14, 10, 4, 6, palette.accent)}
    ${rect(30, 10, 4, 6, palette.accent)}
    ${rect(13, 15, 22, 15, palette.body)}
    ${rect(14, 15, 20, 3, palette.bodyHighlight)}
    ${rect(15, 18, 18, 9, palette.body)}
    ${rect(14, 24, 20, 5, palette.bodyShadow)}
    ${rect(11, 19, 3, 8, palette.body)}
    ${rect(34, 19, 3, 8, palette.body)}
    ${rect(15, 12, 18, 7, palette.body)}
    ${rect(16, 12, 16, 2, palette.bodyHighlight)}
    ${buildEyes(palette)}
    ${rect(21, 21, 6, 3, palette.extra)}
    ${rect(22, 23, 4, 2, palette.extraShadow)}
    ${rect(23, 20, 2, 2, palette.outline)}
    ${rect(14, 16, 2, 2, palette.bodyHighlight)}
    ${rect(31, 16, 2, 2, palette.bodyHighlight)}
    ${rect(14, backLegY, 5, 9, palette.accent)}
    ${rect(20, frontLegY, 5, 9, palette.accent)}
    ${rect(27, backLegY, 5, 9, palette.accent)}
    ${rect(33, frontLegY, 4, 8, palette.accent)}
    ${rect(${tailX}, 24, 4, 8, palette.body)}
    ${rect(${tailX + 1}, 23, 3, 3, palette.bodyHighlight)}
  `;
}

function buildCat(frame, palette) {
  const tailX = frame === 0 ? 36 : 37;
  const frontPawY = frame === 0 ? 32 : 31;
  const backPawY = frame === 0 ? 31 : 32;

  return `
    ${rect(14, 10, 5, 6, palette.accent)}
    ${rect(29, 10, 5, 6, palette.accent)}
    ${rect(12, 15, 24, 13, palette.body)}
    ${rect(14, 15, 20, 3, palette.bodyHighlight)}
    ${rect(13, 24, 22, 5, palette.bodyShadow)}
    ${rect(13, 18, 22, 8, palette.body)}
    ${rect(15, 12, 18, 7, palette.body)}
    ${buildEyes(palette)}
    ${rect(22, 21, 4, 2, palette.extra)}
    ${rect(21, 23, 6, 2, palette.extraShadow)}
    ${rect(12, 20, 2, 1, palette.accentShadow)}
    ${rect(34, 20, 2, 1, palette.accentShadow)}
    ${rect(15, backPawY, 5, 8, palette.accent)}
    ${rect(21, frontPawY, 5, 9, palette.accent)}
    ${rect(27, backPawY, 5, 8, palette.accent)}
    ${rect(${tailX}, 18, 4, 14, palette.accent)}
    ${rect(${tailX + 1}, 18, 2, 4, palette.bodyHighlight)}
  `;
}

function buildDemon(frame, palette) {
  const tailX = frame === 0 ? 35 : 36;
  const footOffset = frame === 0 ? 0 : 1;

  return `
    ${rect(15, 8, 4, 7, palette.accent)}
    ${rect(29, 8, 4, 7, palette.accent)}
    ${rect(13, 14, 22, 14, palette.body)}
    ${rect(15, 14, 18, 3, palette.bodyHighlight)}
    ${rect(14, 24, 20, 5, palette.bodyShadow)}
    ${rect(16, 11, 16, 7, palette.body)}
    ${rect(14, 18, 3, 7, palette.accent)}
    ${rect(31, 18, 3, 7, palette.accent)}
    ${buildEyes(palette)}
    ${rect(20, 21, 8, 3, palette.extra)}
    ${rect(21, 24, 6, 2, palette.extraShadow)}
    ${rect(16, 31, 5, 8, palette.accent)}
    ${rect(27, ${31 + footOffset}, 5, 8, palette.accent)}
    ${rect(${tailX}, 24, 4, 10, palette.accent)}
    ${rect(${tailX + 2}, 32, 3, 3, palette.extra)}
    ${rect(18, 13, 2, 2, palette.bodyHighlight)}
    ${rect(28, 13, 2, 2, palette.bodyHighlight)}
  `;
}

function buildKnight(frame, palette) {
  const swordY = frame === 0 ? 17 : 18;
  const legShift = frame === 0 ? 0 : 1;

  return `
    ${rect(17, 9, 14, 8, palette.body)}
    ${rect(18, 9, 12, 2, palette.bodyHighlight)}
    ${rect(15, 13, 18, 14, palette.body)}
    ${rect(16, 14, 16, 4, palette.bodyHighlight)}
    ${rect(18, 17, 12, 9, palette.bodyShadow)}
    ${rect(14, 18, 3, 10, palette.accent)}
    ${rect(31, 18, 3, 10, palette.accent)}
    ${rect(21, 8, 6, 2, palette.extra)}
    ${rect(16, 11, 16, 2, palette.accent)}
    ${rect(19, 17, 3, 3, palette.detail)}
    ${rect(26, 17, 3, 3, palette.detail)}
    ${rect(22, 21, 4, 2, palette.extra)}
    ${rect(17, ${31 + legShift}, 5, 8, palette.accent)}
    ${rect(26, ${31 - legShift}, 5, 8, palette.accent)}
    ${rect(10, ${swordY}, 2, 15, palette.extra)}
    ${rect(9, ${swordY + 1}, 4, 2, palette.bodyHighlight)}
    ${rect(34, 20, 4, 10, palette.bodyShadow)}
    ${rect(35, 21, 2, 8, palette.body)}
  `;
}

function buildDragon(frame, palette) {
  const tailX = frame === 0 ? 37 : 38;
  const wingY = frame === 0 ? 16 : 15;
  const frontLegY = frame === 0 ? 31 : 30;
  const backLegY = frame === 0 ? 30 : 31;

  return `
    ${rect(11, 16, 22, 13, palette.body)}
    ${rect(13, 16, 16, 3, palette.bodyHighlight)}
    ${rect(13, 24, 18, 5, palette.bodyShadow)}
    ${rect(14, 11, 16, 8, palette.body)}
    ${rect(29, 13, 6, 6, palette.body)}
    ${rect(33, 15, 3, 2, palette.extra)}
    ${rect(14, ${wingY}, 5, 10, palette.accent)}
    ${rect(17, ${wingY + 1}, 6, 10, palette.accentShadow)}
    ${rect(30, 16, 3, 3, palette.accent)}
    ${buildEyes(palette)}
    ${rect(23, 21, 4, 2, palette.extra)}
    ${rect(18, backLegY, 5, 8, palette.accent)}
    ${rect(26, frontLegY, 5, 8, palette.accent)}
    ${rect(${tailX}, 22, 4, 12, palette.accent)}
    ${rect(${tailX + 1}, 31, 4, 3, palette.extra)}
    ${rect(16, 12, 2, 2, palette.extra)}
    ${rect(27, 12, 2, 2, palette.extra)}
  `;
}

function buildCharacter(type, frame, palette) {
  switch (type) {
    case "dog":
      return buildDog(frame, palette);
    case "cat":
      return buildCat(frame, palette);
    case "demon":
      return buildDemon(frame, palette);
    case "knight":
      return buildKnight(frame, palette);
    case "dragon":
      return buildDragon(frame, palette);
    default:
      return buildDog(frame, palette);
  }
}

export function createPetSpriteDataUri(pet) {
  const frame = pet.state === "walking" ? Math.floor((Date.now() + pet.animationSeed) / 220) % 2 : 0;
  const palette = createPalette(pet.colors);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges">
      <rect width="48" height="48" fill="none" />
      ${buildCharacter(pet.type, frame, palette)}
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
