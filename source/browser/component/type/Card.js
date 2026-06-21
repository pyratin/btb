/**
 * @typedef {object} Card
 * @property {string} id The unique identifier of the card.
 * @property {boolean} faceDownFlag Whether the card is face down.
 * @property {string} [editionType] The visual shader edition type of the card (e.g., 'foil', 'holographic', 'polychrome').
 * @property {boolean} [discardFlag] Whether the card is marked for discard.
 * @property {boolean} [playedFlag] Whether the card has been played.
 * @property {boolean} [entryFlag] Whether the card is performing its entry animation.
 * @property {boolean} [activeFlag] Whether the card is selected/active in hand.
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
 * @property {Card} card The card data object.
 * @property {import('react').Ref<CardRef>} [ref] Ref handle to trigger card tilt.
 */

export {};
