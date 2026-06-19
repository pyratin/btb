import { useMemo, useEffect } from 'react';
import { Filter, GlProgram, Ticker, UniformGroup, Texture, Sprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

// Standard PixiJS v8 WebGL2/GLSL 300 es vertex shader with explicit precision.
const vertex = `
  precision highp float;

  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
      vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
      position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
      position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
      return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
      return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
      gl_Position = filterVertexPosition();
      vTextureCoord = filterTextureCoord();
  }
`;

// An authentic, premium Balatro swirling background shader matching the game's commercial GLSL code.
const fragment = `
  precision highp float;

  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform vec4 uInputSize;
  uniform float u_time;
  uniform float u_spin_time;
  uniform vec4 u_colour_1;
  uniform vec4 u_colour_2;
  uniform vec4 u_colour_3;
  uniform float u_contrast;
  uniform float u_spin_amount;
  uniform float u_scale;
  uniform float u_alpha;

  #define PIXEL_SIZE_FAC 700.0
  #define SPIN_EASE 0.5

  void main() {
      vec2 love_ScreenSize = uInputSize.xy;
      vec2 screen_coords = vTextureCoord * uInputSize.xy;

      // Convert to UV coords (0-1) and floor for pixel effect
      float pixel_size = length(love_ScreenSize) / PIXEL_SIZE_FAC;
      vec2 uv = (floor(screen_coords * (1.0 / pixel_size)) * pixel_size - 0.5 * love_ScreenSize) / length(love_ScreenSize) - vec2(0.12, 0.0);
      float uv_len = length(uv);

      // Adding in a center swirl, changes with time.
      float speed = (u_spin_time * SPIN_EASE * 0.2) + 302.2;
      float new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE * 20.0 * (1.0 * u_spin_amount * uv_len + (1.0 - 1.0 * u_spin_amount));
      vec2 mid = (love_ScreenSize / length(love_ScreenSize)) / 2.0;
      uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

      // Now add the paint effect to the swirled UV (scaled by u_scale for layout compatibility)
      uv *= 30.0 * u_scale;
      speed = u_time * 2.0;
      vec2 uv2 = vec2(uv.x + uv.y);

      for (int i = 0; i < 5; i++) {
          uv2 += sin(max(uv.x, uv.y)) + uv;
          uv  += 0.5 * vec2(cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121), sin(uv2.x - 0.113 * speed));
          uv  -= 1.0 * cos(uv.x + uv.y) - 1.0 * sin(uv.x * 0.711 - uv.y);
      }

      // Make the paint amount range from 0 - 2
      float contrast_mod = (0.25 * u_contrast + 0.5 * u_spin_amount + 1.2);
      float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
      float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
      float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
      float c3p = 1.0 - min(1.0, c1p + c2p);

      vec4 ret_col = (0.3 / u_contrast) * u_colour_1 + (1.0 - 0.3 / u_contrast) * (u_colour_1 * c1p + u_colour_2 * c2p + vec4(c3p * u_colour_3.rgb, c3p * u_colour_1.a));

      finalColor = vec4(ret_col.rgb * u_alpha, ret_col.a * u_alpha);
  }
`;

/**
 * BackgroundFilter - Authentic Balatro swirling background filter.
 * Exposes real commercial shader controls: new_colour, special_colour, tertiary_colour, contrast, spin_amount.
 * Derives colors exactly using Balatro's brightness multiplier rules.
 */
export class BackgroundFilter extends Filter {
  /** @type {((ticker: import('pixi.js').Ticker) => void) | null} */
  _tickerCallback = null;

  /** @type {UniformGroup} */
  _uniforms;

  /** @type {number|string|number[]} */
  _new_colour = 0x50846e;

  /** @type {number|string|number[]|null} */
  _special_colour = null;

  /** @type {number|string|number[]|null} */
  _tertiary_colour = null;

  /**
   * @param {BackgroundProps} [options] Configuration options.
   */
  constructor(options = {}) {
    const new_colour = options.new_colour ?? options.new_color ?? options.color ?? options.tint ?? 0x50846e;
    const special_colour = options.special_colour ?? options.special_color ?? null;
    const tertiary_colour = options.tertiary_colour ?? options.tertiary_color ?? null;
    const contrast = options.contrast ?? 0.85;
    const spin_amount = options.spin_amount ?? 0.0;
    const scale = options.scale ?? 1.0;
    const speed = options.speed ?? 0.3;
    const alpha = options.alpha ?? options.opacity ?? 1.0;

    // 1. Initialize dynamic uniform group
    const shaderUniforms = new UniformGroup({
      u_time: { value: 0.0, type: 'f32' },
      u_spin_time: { value: 0.0, type: 'f32' },
      u_colour_1: { value: [0, 0, 0, 1], type: 'vec4<f32>' },
      u_colour_2: { value: [0, 0, 0, 1], type: 'vec4<f32>' },
      u_colour_3: { value: [0, 0, 0, 1], type: 'vec4<f32>' },
      u_contrast: { value: contrast, type: 'f32' },
      u_spin_amount: { value: spin_amount, type: 'f32' },
      u_scale: { value: scale, type: 'f32' },
      u_speed: { value: speed, type: 'f32' },
      u_alpha: { value: alpha, type: 'f32' },
    });

    // 2. Call super Filter constructor
    super({
      glProgram: GlProgram.from({
        vertex,
        fragment,
      }),
      resources: {
        shaderUniforms,
      },
      resolution: 1.0,
    });

    this._uniforms = shaderUniforms;
    this._new_colour = new_colour;
    this._special_colour = special_colour;
    this._tertiary_colour = tertiary_colour;
    this.updateColors();

    // 3. Auto-animate using global ticker callback
    let elapsedSeconds = 0;
    let elapsedSpinSeconds = 0;
    this._tickerCallback = (ticker) => {
      const dt = ticker.deltaTime / 60;
      elapsedSeconds += dt * this.speed;
      elapsedSpinSeconds += dt * this.speed * this.spin_amount;
      this._uniforms.uniforms.u_time = elapsedSeconds;
      this._uniforms.uniforms.u_spin_time = elapsedSpinSeconds;
    };

    Ticker.shared.add(this._tickerCallback);
  }

  /**
   * Helper to clamp color values to range [0.0, 1.0].
   * @param {number} val - The input value to clamp.
   * @returns {number} The clamped value.
   */
  _clamp(val) {
    return Math.min(1.0, Math.max(0.0, val));
  }

  /**
   * Update the internal uniform colors based on Balatro's exact brightness logic.
   */
  updateColors() {
    const mainRgb = hexToRgb(this._new_colour);
    let cRgb, lRgb, dRgb;

    if (this._special_colour !== null && this._tertiary_colour !== null) {
      // Direct overrides: L = new_colour, C = special_colour, D = tertiary_colour
      lRgb = mainRgb;
      cRgb = hexToRgb(this._special_colour);
      dRgb = hexToRgb(this._tertiary_colour);
    } else {
      // Balatro's ease_background_colour logic:
      // L (colour_2) multiplier = 1.3
      // C (colour_1) multiplier = 0.9 (or special_colour if provided)
      // D (colour_3) multiplier = 0.7 (or 0.4 if special_colour is provided)
      lRgb = [this._clamp(mainRgb[0] * 1.3), this._clamp(mainRgb[1] * 1.3), this._clamp(mainRgb[2] * 1.3)];

      if (this._special_colour !== null) {
        cRgb = hexToRgb(this._special_colour);
        dRgb = [this._clamp(mainRgb[0] * 0.4), this._clamp(mainRgb[1] * 0.4), this._clamp(mainRgb[2] * 0.4)];
      } else {
        cRgb = [this._clamp(mainRgb[0] * 0.9), this._clamp(mainRgb[1] * 0.9), this._clamp(mainRgb[2] * 0.9)];
        dRgb = [this._clamp(mainRgb[0] * 0.7), this._clamp(mainRgb[1] * 0.7), this._clamp(mainRgb[2] * 0.7)];
      }
    }

    this._uniforms.uniforms.u_colour_1 = [...cRgb, 1.0];
    this._uniforms.uniforms.u_colour_2 = [...lRgb, 1.0];
    this._uniforms.uniforms.u_colour_3 = [...dRgb, 1.0];
  }

  /**
   * Primary background color getter.
   * @type {number|string|number[]}
   */
  get new_colour() {
    return this._new_colour;
  }

  /**
   * Primary background color setter.
   * @param {number|string|number[]} value - The new color.
   */
  set new_colour(value) {
    this._new_colour = value;
    this.updateColors();
  }

  /**
   * Alias for new_colour getter.
   * @type {number|string|number[]}
   */
  get new_color() {
    return this.new_colour;
  }

  /**
   * Alias for new_colour setter.
   * @param {number|string|number[]} value - The new color.
   */
  set new_color(value) {
    this.new_colour = value;
  }

  /**
   * Alias for new_colour getter.
   * @type {number|string|number[]}
   */
  get color() {
    return this.new_colour;
  }

  /**
   * Alias for new_colour setter.
   * @param {number|string|number[]} value - The new color.
   */
  set color(value) {
    this.new_colour = value;
  }

  /**
   * Alias for new_colour getter.
   * @type {number|string|number[]}
   */
  get tint() {
    return this.new_colour;
  }

  /**
   * Alias for new_colour setter.
   * @param {number|string|number[]} value - The new color.
   */
  set tint(value) {
    this.new_colour = value;
  }

  /**
   * Special color (center color) getter.
   * @type {number|string|number[]|null}
   */
  get special_colour() {
    return this._special_colour;
  }

  /**
   * Special color (center color) setter.
   * @param {number|string|number[]|null} value - The new special color.
   */
  set special_colour(value) {
    this._special_colour = value;
    this.updateColors();
  }

  /**
   * Alias for special_colour getter.
   * @type {number|string|number[]|null}
   */
  get special_color() {
    return this.special_colour;
  }

  /**
   * Alias for special_colour setter.
   * @param {number|string|number[]|null} value - The new special color.
   */
  set special_color(value) {
    this.special_colour = value;
  }

  /**
   * Tertiary color (shadow color) getter.
   * @type {number|string|number[]|null}
   */
  get tertiary_colour() {
    return this._tertiary_colour;
  }

  /**
   * Tertiary color (shadow color) setter.
   * @param {number|string|number[]|null} value - The new tertiary color.
   */
  set tertiary_colour(value) {
    this._tertiary_colour = value;
    this.updateColors();
  }

  /**
   * Alias for tertiary_colour getter.
   * @type {number|string|number[]|null}
   */
  get tertiary_color() {
    return this.tertiary_colour;
  }

  /**
   * Alias for tertiary_colour setter.
   * @param {number|string|number[]|null} value - The new tertiary color.
   */
  set tertiary_color(value) {
    this.tertiary_colour = value;
  }

  /**
   * Contrast getter.
   * @type {number}
   */
  get contrast() {
    return /** @type {number} */ (this._uniforms.uniforms.u_contrast);
  }

  /**
   * Contrast setter.
   * @param {number} value - The contrast value.
   */
  set contrast(value) {
    this._uniforms.uniforms.u_contrast = value;
  }

  /**
   * Spin amount getter.
   * @type {number}
   */
  get spin_amount() {
    return /** @type {number} */ (this._uniforms.uniforms.u_spin_amount);
  }

  /**
   * Spin amount setter.
   * @param {number} value - The spin amount value.
   */
  set spin_amount(value) {
    this._uniforms.uniforms.u_spin_amount = value;
  }

  /**
   * Scale getter.
   * @type {number}
   */
  get scale() {
    return /** @type {number} */ (this._uniforms.uniforms.u_scale);
  }

  /**
   * Scale setter.
   * @param {number} value - The scale value.
   */
  set scale(value) {
    this._uniforms.uniforms.u_scale = value;
  }

  /**
   * Speed getter.
   * @type {number}
   */
  get speed() {
    return /** @type {number} */ (this._uniforms.uniforms.u_speed);
  }

  /**
   * Speed setter.
   * @param {number} value - The speed multiplier.
   */
  set speed(value) {
    this._uniforms.uniforms.u_speed = value;
  }

  /**
   * Alpha getter.
   * @type {number}
   */
  get alpha() {
    return /** @type {number} */ (this._uniforms.uniforms.u_alpha);
  }

  /**
   * Alpha setter.
   * @param {number} value - The alpha value.
   */
  set alpha(value) {
    this._uniforms.uniforms.u_alpha = value;
  }

  /**
   * Opacity getter.
   * @type {number}
   */
  get opacity() {
    return this.alpha;
  }

  /**
   * Opacity setter.
   * @param {number} value - The opacity value.
   */
  set opacity(value) {
    this.alpha = value;
  }

  /**
   * Cleanup Ticker subscription to prevent memory leaks when component unmounts.
   */
  destroy() {
    if (this._tickerCallback) {
      Ticker.shared.remove(this._tickerCallback);
      this._tickerCallback = null;
    }
    super.destroy();
  }
}

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
 * @typedef {object} BackgroundProps
 * @property {number|string|number[]} [new_colour] The primary background color (default: `0x50846e` - Small Blind Green).
 * @property {number|string|number[]} [new_color] Alias for new_colour.
 * @property {number|string|number[]} [color] Alias for new_colour.
 * @property {number|string|number[]} [tint] Alias for new_colour.
 * @property {number|string|number[]} [special_colour] The center background color override.
 * @property {number|string|number[]} [special_color] Alias for special_colour.
 * @property {number|string|number[]} [tertiary_colour] The shadow background color override.
 * @property {number|string|number[]} [tertiary_color] Alias for tertiary_colour.
 * @property {number} [contrast] The contrast of the swirling pattern (default: 1.0).
 * @property {number} [spin_amount] Twist/spin intensity of the swirling pattern (default: 0.25).
 * @property {number} [scale] Scale factor for pattern frequency (default: 1.0).
 * @property {number} [speed] Animation speed multiplier (default: 1.0).
 * @property {number} [alpha] Opacity of the background (default: 1.0).
 * @property {number} [opacity] Alias for alpha.
 */

/**
 * Background Component
 * Renders a full-screen or container-contained authentic Balatro swirling shader background.
 * @param {BackgroundProps & Record<string, unknown>} props Component properties.
 * @returns {import('react').ReactElement} The rendered React component.
 */
const Background = ({
  new_colour = 0x50846e,
  new_color,
  color,
  tint,
  special_colour = null,
  special_color,
  tertiary_colour = null,
  tertiary_color,
  contrast = 0.85,
  spin_amount = 0.0,
  scale = 1.0,
  speed = 0.3,
  alpha = 1.0,
  opacity,
  ...props
}) => {
  useExtend({ LayoutContainer, Sprite });

  // Resolve values prioritizing primary parameters and falling back to aliases
  const resolvedNewColour = new_colour !== 0x50846e ? new_colour : (new_color ?? color ?? tint ?? 0x50846e);
  const resolvedSpecialColour = special_colour !== null ? special_colour : (special_color ?? null);
  const resolvedTertiaryColour = tertiary_colour !== null ? tertiary_colour : (tertiary_color ?? null);
  const resolvedAlpha = alpha !== 1.0 ? alpha : (opacity ?? 1.0);

  const filter = useMemo(() => new BackgroundFilter({
    new_colour: resolvedNewColour,
    special_colour: resolvedSpecialColour,
    tertiary_colour: resolvedTertiaryColour,
    contrast,
    spin_amount,
    scale,
    speed,
    alpha: resolvedAlpha
  }), // eslint-disable-next-line @eslint-react/exhaustive-deps
  []);

  // Update properties dynamically on the instantiated filter to avoid recreation overhead
  useEffect(() => {
    filter.new_colour = resolvedNewColour;
  }, [filter, resolvedNewColour]);

  useEffect(() => {
    filter.special_colour = resolvedSpecialColour;
  }, [filter, resolvedSpecialColour]);

  useEffect(() => {
    filter.tertiary_colour = resolvedTertiaryColour;
  }, [filter, resolvedTertiaryColour]);

  useEffect(() => {
    filter.contrast = contrast;
  }, [filter, contrast]);

  useEffect(() => {
    filter.spin_amount = spin_amount;
  }, [filter, spin_amount]);

  useEffect(() => {
    filter.scale = scale;
  }, [filter, scale]);

  useEffect(() => {
    filter.speed = speed;
  }, [filter, speed]);

  useEffect(() => {
    filter.alpha = resolvedAlpha;
  }, [filter, resolvedAlpha]);

  // Clean up the filter instance on unmount to prevent memory leaks from ticker subscriptions
  useEffect(() => {
    return () => {
      filter.destroy();
    };
  }, [filter]);

  const filters = useMemo(() => [filter], [filter]);

  return (
    <pixiLayoutContainer
      layout={{ position: 'absolute', width: '100%', height: '100%' }}
      {...props}
    >
      <pixiSprite
        texture={Texture.WHITE}
        layout={{ width: '100%', height: '100%', flex: 1 }}
        filters={filters}
      />
    </pixiLayoutContainer>
  );
};

Background.displayName = 'Background';

export default Background;
