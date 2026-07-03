/**
 * @typedef {object} Card
 * @property {string} id The unique identifier of the card.
 * @property {number} packIndex The pack index of the card.
 * @property {number} rankIndex The rank index of the card.
 * @property {number[]} rankIndexCollection The collection of rank indices.
 * @property {string | number} rank The rank of the card.
 * @property {number} suitIndex The suit index of the card.
 * @property {number[]} suitIndexCollection The collection of suit indices.
 * @property {string} suit The suit of the card.
 * @property {boolean} faceDownFlag Whether the card is face down.
 * @property {boolean} [discardFlag] Whether the card is marked for discard.
 * @property {boolean} [playedFlag] Whether the card has been played.
 * @property {boolean} [entryFlag] Whether the card is performing its entry animation.
 * @property {boolean} [activeFlag] Whether the card is selected/active in hand.
 * @property {string} [editionType] The visual shader edition type of the card (e.g., 'foil', 'holographic', 'polychrome').
 * @property {string} [enhancementType] The enhancement type of the card (e.g., 'stone', 'gold', 'combo', 'mult', 'wild', 'lucky', 'glass', 'steel').
 * @property {boolean} [scoringFlag] Whether the card is scoring.
 * @property {boolean} [scoringActiveFlag] Whether the card is active in scoring.
 */

/**
 * @typedef {object} CardRef
 * @property {(x: number, y: number) => void} setTilt Set card tilt targets.
 * @property {() => void} resetTilt Reset card tilt to default.
 * @property {import('pixi.js').PerspectiveMesh | null} mesh The underlying PixiJS PerspectiveMesh.
 */

/**
 * @typedef {object} CardProps
 * @property {string} [cursor] The cursor style when hovering over the card.
 * @property {boolean} [idle] Whether the card should play the idle perspective wobble.
 * @property {boolean} [perspectiveMeshDisableFlag] Whether to disable the 3D warp perspective effect.
 * @property {Omit<import('pixi.js').ContainerOptions, 'children'>} [shadowConfiguration] The shadow configuration.
 * @property {Card} card The card data object.
 * @property {import('react').Ref<CardRef>} [ref] Ref handle to trigger card tilt.
 */

export {};
