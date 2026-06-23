/**
 * @typedef {object} ButtonPadding
 * @property {number} [padding] General padding.
 * @property {number} [paddingTop] Top padding.
 * @property {number} [paddingBottom] Bottom padding.
 * @property {number} [paddingLeft] Left padding.
 * @property {number} [paddingRight] Right padding.
 */

/**
 * @typedef {object} ButtonProps
 * @property {string} text The button text.
 * @property {number} fontSize The font size.
 * @property {ButtonPadding} padding The button padding configuration.
 * @property {number} [borderRadius] The border radius.
 * @property {string | number} [backgroundColor] The background color.
 * @property {boolean} [disableFlag] Disable button flag.
 * @property {() => void} onPointerTap Tap callback.
 */

export {};
