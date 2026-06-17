/**
 * Balatro Background Presets and Utilities
 * Defines authentic color maps and state configurations matching Balatro's gameplay.
 */

// Base color definitions matching Balatro's globals.lua config
export const BALATRO_COLORS = {
  RED: 0xFE5F55,
  BLUE: 0x009DFF,
  FILTER: 0xFF9A00,
  PURPLE: 0x8867A5,
  BLACK: 0x374244,
  L_BLACK: 0x4F6367,
  GREY: 0x5F7377,
  SPECTRAL: 0x4584FA,
  SMALL_BLIND: 0x50846E,
  BIG_BLIND: 0x50846E,
  BOSS_BLIND_DEFAULT: 0xB44430
};

/**
 * Parses Hex or string colors into [R, G, B] floats between 0.0 and 1.0.
 * @param {number|string|number[]} hex The input color format to convert.
 * @returns {number[]} The array representing red, green, blue values from 0 to 1.
 */
function hexToRgb(hex) {
  if (Array.isArray(hex)) return [hex[0], hex[1], hex[2]];

  let numHex = 0x000000;
  if (typeof hex === 'string') {
    numHex = parseInt(hex.replace(/^#/, ''), 16);
  } else if (typeof hex === 'number') {
    numHex = hex;
  }

  const r = ((numHex >> 16) & 0xff) / 255;
  const g = ((numHex >> 8) & 0xff) / 255;
  const b = (numHex & 0xff) / 255;
  return [r, g, b];
}

/**
 * Converts float RGB values back to integer Hex.
 * @param {number[]} rgb Float RGB values [0-1].
 * @returns {number} Integer hex representation.
 */
function rgbToHex(rgb) {
  const r = Math.round(Math.min(1.0, Math.max(0.0, rgb[0])) * 255);
  const g = Math.round(Math.min(1.0, Math.max(0.0, rgb[1])) * 255);
  const b = Math.round(Math.min(1.0, Math.max(0.0, rgb[2])) * 255);
  return (r << 16) + (g << 8) + b;
}

/**
 * Interpolates/mixes two colors proportionally.
 * @param {number|string|number[]} c1 First color.
 * @param {number|string|number[]} c2 Second color.
 * @param {number} weight Proportional weight of the first color (0 to 1).
 * @returns {number} Hex mixed color.
 */
export function mixColours(c1, c2, weight) {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const mixed = [
    rgb1[0] * weight + rgb2[0] * (1 - weight),
    rgb1[1] * weight + rgb2[1] * (1 - weight),
    rgb1[2] * weight + rgb2[2] * (1 - weight)
  ];
  return rgbToHex(mixed);
}

/**
 * Multiplies RGB components to darken the color.
 * @param {number|string|number[]} colour The input color.
 * @param {number} percent The percentage to darken (0 to 1).
 * @returns {number} Hex darkened color.
 */
export function darken(colour, percent) {
  const rgb = hexToRgb(colour);
  const darkened = [
    rgb[0] * (1 - percent),
    rgb[1] * (1 - percent),
    rgb[2] * (1 - percent)
  ];
  return rgbToHex(darkened);
}

/**
 * Interpolates RGB components toward 1.0 to lighten the color.
 * @param {number|string|number[]} colour The input color.
 * @param {number} percent The percentage to lighten (0 to 1).
 * @returns {number} Hex lightened color.
 */
export function lighten(colour, percent) {
  const rgb = hexToRgb(colour);
  const lightened = [
    rgb[0] * (1 - percent) + percent,
    rgb[1] * (1 - percent) + percent,
    rgb[2] * (1 - percent) + percent
  ];
  return rgbToHex(lightened);
}

/**
 * @typedef {object} BackgroundPreset
 * @property {number} new_colour The primary background color.
 * @property {number|null} [special_colour] The center background color override.
 * @property {number|null} [tertiary_colour] The shadow background color override.
 * @property {number} contrast The contrast of the swirling pattern.
 * @property {number} spin_amount Twist/spin intensity of the swirling pattern.
 * @property {number} speed Animation speed multiplier.
 * @property {number} scale Scale/frequency of the swirl pattern.
 * @property {number} alpha Opacity of the background.
 */

/** @type {Record<'DEFAULT' | 'TAROT_PACK' | 'SPECTRAL_PACK' | 'STANDARD_PACK' | 'BUFFOON_PACK' | 'PLANET_PACK' | 'GAME_WON', BackgroundPreset>} */
export const BACKGROUND_PRESETS = {
  // Main Menu / Small & Big Blind gameplay states (HEX("50846e"))
  DEFAULT: {
    new_colour: BALATRO_COLORS.SMALL_BLIND,
    special_colour: null,
    tertiary_colour: null,
    contrast: 1.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  },

  // Tarot Pack state (Purple background with dark shadow center)
  TAROT_PACK: {
    new_colour: BALATRO_COLORS.PURPLE,
    special_colour: darken(BALATRO_COLORS.BLACK, 0.2), // Darkened base center
    tertiary_colour: null,
    contrast: 1.5,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  },

  // Spectral Pack state (Spectral blue background with dark shadow center)
  SPECTRAL_PACK: {
    new_colour: BALATRO_COLORS.SPECTRAL,
    special_colour: darken(BALATRO_COLORS.BLACK, 0.2),
    tertiary_colour: null,
    contrast: 2.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  },

  // Standard Pack state (High-contrast red center and dark background)
  STANDARD_PACK: {
    new_colour: darken(BALATRO_COLORS.BLACK, 0.2),
    special_colour: BALATRO_COLORS.RED,
    tertiary_colour: null,
    contrast: 3.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  },

  // Buffoon Pack state (Orange filter with solid black center)
  BUFFOON_PACK: {
    new_colour: BALATRO_COLORS.FILTER,
    special_colour: 0x000000,
    tertiary_colour: null,
    contrast: 2.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  },

  // Planet Pack state (Deep outer space black swirl)
  PLANET_PACK: {
    new_colour: 0x000000,
    special_colour: null,
    tertiary_colour: null,
    contrast: 3.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  },

  // Won Game state (Calming gray/blue-gray background)
  GAME_WON: {
    new_colour: BALATRO_COLORS.L_BLACK,
    special_colour: null,
    tertiary_colour: null,
    contrast: 1.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  }
};

/**
 * Returns the exact Balatro-derived background settings for a specific Boss Blind.
 * @param {number|string} bossColour Primary color of the boss blind (e.g. BALATRO_COLORS.BOSS_BLIND_DEFAULT).
 * @param {boolean} [isShowdown] If true, renders the high-contrast Showdown Blue/Red swirl.
 * @returns {BackgroundPreset} Background settings preset.
 */
export function getPresetForBlind(bossColour, isShowdown = false) {
  if (isShowdown) {
    // Showdown Boss: Blue base, Red center, extremely dark shadow, contrast 3.0
    return {
      new_colour: BALATRO_COLORS.BLUE,
      special_colour: BALATRO_COLORS.RED,
      tertiary_colour: darken(BALATRO_COLORS.BLACK, 0.4),
      contrast: 3.0,
      spin_amount: 0.25,
      speed: 1.0,
      scale: 1.0,
      alpha: 1.0
    };
  }

  // Normal Boss: Lightened mix of boss color and black as base, boss color as center, contrast 2.0
  const derivedBase = lighten(mixColours(bossColour, BALATRO_COLORS.BLACK, 0.3), 0.1);
  return {
    new_colour: derivedBase,
    special_colour: typeof bossColour === 'string' ? parseInt(bossColour.replace(/^#/, ''), 16) : bossColour,
    tertiary_colour: null,
    contrast: 2.0,
    spin_amount: 0.25,
    speed: 1.0,
    scale: 1.0,
    alpha: 1.0
  };
}

/**
 * Unified resolver to retrieve a preset or derive background properties based on game state/phase.
 * @param {string} state Game state name (e.g. 'TAROT_PACK', 'PLANET_PACK', 'DEFAULT', 'BOSS_BLIND').
 * @param {object} [options] Extra options like showdown flag or specific boss color.
 * @param {number|string} [options.bossColour] Boss color override if state is 'BOSS_BLIND'.
 * @param {boolean} [options.isShowdown] Showdown flag for boss blinds.
 * @returns {BackgroundPreset} Background settings preset.
 */
export function getPresetForState(state, options = {}) {
  const upperState = state.toUpperCase();

  if (BACKGROUND_PRESETS[upperState]) {
    return BACKGROUND_PRESETS[upperState];
  }

  if (upperState === 'BOSS_BLIND') {
    const bossCol = options.bossColour ?? BALATRO_COLORS.BOSS_BLIND_DEFAULT;
    return getPresetForBlind(bossCol, options.isShowdown);
  }

  // Default fallback (Small/Big Blind green)
  return BACKGROUND_PRESETS.DEFAULT;
}
