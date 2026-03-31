const CHARACTER_CATALOG = [
  {
    type: "dog",
    label: "Samoyed",
    description: "A fluffy pixel cloud dog with bright, cheerful energy.",
    defaultVariant: "snow",
    sloganPoolId: "dog",
    variants: [
      {
        id: "snow",
        label: "White",
        colors: { body: "#f6f5f2", accent: "#d9dbe6", detail: "#202739", extra: "#ffbfd0" }
      },
      {
        id: "mist",
        label: "Light Gray",
        colors: { body: "#dfe2e8", accent: "#b8bec9", detail: "#202739", extra: "#ffbfd0" }
      }
    ]
  },
  {
    type: "cat",
    label: "Fat Orange Cat",
    description: "A round sleepy cat with a dramatic little strut.",
    defaultVariant: "orange",
    sloganPoolId: "cat",
    variants: [
      {
        id: "orange",
        label: "Orange",
        colors: { body: "#f4a54b", accent: "#d87f2e", detail: "#2a2335", extra: "#ffe1b5" }
      },
      {
        id: "cream",
        label: "Cream",
        colors: { body: "#f5d7a9", accent: "#d9b680", detail: "#2a2335", extra: "#ffc999" }
      }
    ]
  },
  {
    type: "demon",
    label: "Demon",
    description: "A tiny horned rival with a smug but oddly supportive face.",
    defaultVariant: "ember",
    sloganPoolId: "demon",
    variants: [
      {
        id: "ember",
        label: "Red",
        colors: { body: "#d65b67", accent: "#9d2039", detail: "#1f1730", extra: "#ffd9a3" }
      },
      {
        id: "azure",
        label: "Blue",
        colors: { body: "#5e7de1", accent: "#2d3c9f", detail: "#1c1730", extra: "#ffd9a3" }
      },
      {
        id: "violet",
        label: "Purple",
        colors: { body: "#9b68d9", accent: "#6332a0", detail: "#241630", extra: "#ffd9a3" }
      }
    ]
  },
  {
    type: "knight",
    label: "Holy Knight",
    description: "A tiny heroic guardian with bright armor and a tiny plume.",
    defaultVariant: "silver",
    sloganPoolId: "knight",
    variants: [
      {
        id: "silver",
        label: "Silver",
        colors: { body: "#d9e1ed", accent: "#98a8bf", detail: "#20314b", extra: "#ffd772" }
      },
      {
        id: "gold",
        label: "Gold",
        colors: { body: "#f1d27c", accent: "#c49a35", detail: "#20314b", extra: "#fff1bf" }
      },
      {
        id: "white",
        label: "White",
        colors: { body: "#f5f7fb", accent: "#c8d0de", detail: "#20314b", extra: "#ffd772" }
      }
    ]
  },
  {
    type: "dragon",
    label: "Dragon",
    description: "A small chibi dragon with a bold silhouette and soft eyes.",
    defaultVariant: "fern",
    sloganPoolId: "dragon",
    variants: [
      {
        id: "fern",
        label: "Green",
        colors: { body: "#6cc07e", accent: "#3f8753", detail: "#1d2d28", extra: "#ffd67a" }
      },
      {
        id: "ember",
        label: "Red",
        colors: { body: "#d86854", accent: "#a03b33", detail: "#2f211d", extra: "#ffd67a" }
      },
      {
        id: "onyx",
        label: "Black",
        colors: { body: "#4a515f", accent: "#232935", detail: "#f5f6fb", extra: "#ffd67a" }
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
