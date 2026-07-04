/** @typedef {ReturnType<typeof import('../useStore.js').cardGet>} Card */

/**
 * @typedef {object} CardRef
 * @property {(x: number, y: number) => void} setTilt Set card tilt targets.
 * @property {() => void} resetTilt Reset card tilt to default.
 * @property {import('pixi.js').PerspectiveMesh | null} mesh The underlying
 *   PixiJS PerspectiveMesh.
 */

/**
 * @typedef {object} CardProps
 * @property {string} [cursor] The cursor style when hovering over the card.
 * @property {boolean} [idle] Whether the card should play the idle perspective
 *   wobble.
 * @property {boolean} [lastFlag] whether the card is the last card.
 * @property {boolean} [perspectiveMeshDisableFlag] Whether to disable the 3D
 *   warp perspective effect.
 * @property {Omit<import('pixi.js').ContainerOptions, 'children'>} [shadowConfiguration]
 *   The shadow configuration.
 * @property {Card} card The card data object.
 * @property {import('react').Ref<CardRef>} [ref] Ref handle to trigger card
 *   tilt.
 */

export {};
