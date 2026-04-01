const CHARACTER_CATALOG = [
  {
    type: "dog",
    label: "Samoyed",
    description: "A fluffy cheerful dog.",
    defaultVariant: "snow",
    sloganPoolId: "dog",
    variants: [
      {
        id: "snow",
        label: "White",
        colors: { body: "#f5f5f0", accent: "#d9dbe6", detail: "#1f2437", extra: "#ffc2d7" }
      },
      {
        id: "mist",
        label: "Gray",
        colors: { body: "#dfe2e8", accent: "#b7bec9", detail: "#1f2437", extra: "#ffc2d7" }
      }
    ]
  },
  {
    type: "cat",
    label: "Fat Orange Cat",
    description: "A round sleepy cat.",
    defaultVariant: "orange",
    sloganPoolId: "cat",
    variants: [
      {
        id: "orange",
        label: "Orange",
        colors: { body: "#f4a54b", accent: "#d87f2e", detail: "#2a2335", extra: "#ffe2ba" }
      },
      {
        id: "cream",
        label: "Cream",
        colors: { body: "#f5d8ad", accent: "#dbb680", detail: "#2a2335", extra: "#ffc999" }
      }
    ]
  },
  {
    type: "demon",
    label: "Demon",
    description: "A tiny smug rival.",
    defaultVariant: "ember",
    sloganPoolId: "demon",
    variants: [
      {
        id: "ember",
        label: "Red",
        colors: { body: "#d76169", accent: "#a4283d", detail: "#20152f", extra: "#ffd4a1" }
      },
      {
        id: "violet",
        label: "Purple",
        colors: { body: "#9a68d7", accent: "#6331a0", detail: "#23152f", extra: "#ffd4a1" }
      }
    ]
  },
  {
    type: "knight",
    label: "Holy Knight",
    description: "A tiny armored guardian.",
    defaultVariant: "silver",
    sloganPoolId: "knight",
    variants: [
      {
        id: "silver",
        label: "Silver",
        colors: { body: "#d9e1ed", accent: "#95a7bf", detail: "#22334b", extra: "#ffd772" }
      },
      {
        id: "gold",
        label: "Gold",
        colors: { body: "#f1d27c", accent: "#c59a38", detail: "#22334b", extra: "#fff2c4" }
      }
    ]
  },
  {
    type: "dragon",
    label: "Dragon",
    description: "A chibi dragon with wings.",
    defaultVariant: "fern",
    sloganPoolId: "dragon",
    variants: [
      {
        id: "fern",
        label: "Green",
        colors: { body: "#6cc07e", accent: "#3f8753", detail: "#1f2d29", extra: "#ffd67a" }
      },
      {
        id: "ember",
        label: "Red",
        colors: { body: "#d86754", accent: "#a03b33", detail: "#2f211d", extra: "#ffd67a" }
      }
    ]
  }
];

function getCharacterDefinition(type) {
  return CHARACTER_CATALOG.find((character) => character.type === type) || CHARACTER_CATALOG[0];
}

function getVariantDefinition(type, variantId) {
  const character = getCharacterDefinition(type);
  return character.variants.find((variant) => variant.id === variantId) || character.variants[0];
}

module.exports = {
  CHARACTER_CATALOG,
  getCharacterDefinition,
  getVariantDefinition
};
