import { useMemo, useEffect } from 'react';
import { Shader, GlProgram, Ticker, UniformGroup, Mesh, MeshGeometry, Texture } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';

// Standard PixiJS v8 Mesh vertex shader using projection and transform matrices.
const vertex = `
  precision highp float;

  in vec2 aPosition;
  in vec2 aUV;
  out vec2 vTextureCoord;

  uniform mat3 uProjectionMatrix;
  uniform mat3 uWorldTransformMatrix;
  uniform mat3 uTransformMatrix;

  void main(void) {
      mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
      gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
      vTextureCoord = aUV;
  }
`;

// An authentic, premium Balatro swirling background fragment shader.
const fragment = `
  precision highp float;

  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform vec2 u_resolution;
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
      vec2 love_ScreenSize = u_resolution;
      vec2 screen_coords = vTextureCoord * u_resolution;

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
 * BackgroundShader - Authentic Balatro swirling background shader.
 * Drawn directly on a full-screen mesh to save rendering passes.
 */
export class BackgroundShader extends Shader {
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

  /** @type {Texture} */
  texture = Texture.EMPTY;

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
      u_resolution: { value: [800, 600], type: 'vec2<f32>' },
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

    // 2. Call super Shader constructor
    super({
      glProgram: GlProgram.from({
        vertex,
        fragment,
      }),
      resources: {
        shaderUniforms,
      },
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
   * Updates the u_resolution uniform with current dimensions.
   * @param {number} width Width of the viewport.
   * @param {number} height Height of the viewport.
   */
  updateResolution(width, height) {
    this._uniforms.uniforms.u_resolution = [width, height];
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
      lRgb = mainRgb;
      cRgb = hexToRgb(this._special_colour);
      dRgb = hexToRgb(this._tertiary_colour);
    } else {
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

  get new_colour() {
    return this._new_colour;
  }

  set new_colour(value) {
    this._new_colour = value;
    this.updateColors();
  }

  get new_color() {
    return this.new_colour;
  }

  set new_color(value) {
    this.new_colour = value;
  }

  get color() {
    return this.new_colour;
  }

  set color(value) {
    this.new_colour = value;
  }

  get tint() {
    return this.new_colour;
  }

  set tint(value) {
    this.new_colour = value;
  }

  get special_colour() {
    return this._special_colour;
  }

  set special_colour(value) {
    this._special_colour = value;
    this.updateColors();
  }

  get special_color() {
    return this.special_colour;
  }

  set special_color(value) {
    this.special_colour = value;
  }

  get tertiary_colour() {
    return this._tertiary_colour;
  }

  set tertiary_colour(value) {
    this._tertiary_colour = value;
    this.updateColors();
  }

  get tertiary_color() {
    return this.tertiary_color;
  }

  set tertiary_color(value) {
    this.tertiary_colour = value;
  }

  get contrast() {
    return /** @type {number} */ (this._uniforms.uniforms.u_contrast);
  }

  set contrast(value) {
    this._uniforms.uniforms.u_contrast = value;
  }

  get spin_amount() {
    return /** @type {number} */ (this._uniforms.uniforms.u_spin_amount);
  }

  set spin_amount(value) {
    this._uniforms.uniforms.u_spin_amount = value;
  }

  get scale() {
    return /** @type {number} */ (this._uniforms.uniforms.u_scale);
  }

  set scale(value) {
    this._uniforms.uniforms.u_scale = value;
  }

  get speed() {
    return /** @type {number} */ (this._uniforms.uniforms.u_speed);
  }

  set speed(value) {
    this._uniforms.uniforms.u_speed = value;
  }

  get alpha() {
    return /** @type {number} */ (this._uniforms.uniforms.u_alpha);
  }

  set alpha(value) {
    this._uniforms.uniforms.u_alpha = value;
  }

  get opacity() {
    return this.alpha;
  }

  set opacity(value) {
    this.alpha = value;
  }

  destroy() {
    if (this._tickerCallback) {
      Ticker.shared.remove(this._tickerCallback);
      this._tickerCallback = null;
    }
    super.destroy();
  }
}

/**
 * Converts a hex color string, number, or array to RGB components normalized to [0.0, 1.0].
 * @param {string|number|number[]} hex - The hex color to convert.
 * @returns {number[]} The RGB color components.
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
 * Background Component.
 * Renders an optimized full-screen swirling shader background directly on a Mesh.
 * @param {object} root0 - The component props.
 * @param {number|string|number[]} [root0.new_colour] - Main background color.
 * @param {number|string|number[]} [root0.new_color] - Alias for new_colour.
 * @param {number|string|number[]} [root0.color] - Alias for new_colour.
 * @param {number|string|number[]} [root0.tint] - Alias for new_colour.
 * @param {number|string|number[]|null} [root0.special_colour] - Secondary color.
 * @param {number|string|number[]} [root0.special_color] - Alias for special_colour.
 * @param {number|string|number[]|null} [root0.tertiary_colour] - Tertiary color.
 * @param {number|string|number[]} [root0.tertiary_color] - Alias for tertiary_colour.
 * @param {number} [root0.contrast] - Background contrast multiplier.
 * @param {number} [root0.spin_amount] - Spin speed multiplier.
 * @param {number} [root0.scale] - Texture scale.
 * @param {number} [root0.speed] - Animation speed multiplier.
 * @param {number} [root0.alpha] - Background opacity.
 * @param {number} [root0.opacity] - Alias for alpha.
 * @returns {import('react').ReactElement} The rendered background layout container.
 */
const Background = ({
  new_colour = 0x50846e,
  new_color = undefined,
  color = undefined,
  tint = undefined,
  special_colour = null,
  special_color = undefined,
  tertiary_colour = null,
  tertiary_color = undefined,
  contrast = 0.85,
  spin_amount = 0.0,
  scale = 1.0,
  speed = 1.0,
  alpha = 1.0,
  opacity = undefined,
  ...props
}) => {
  useExtend({ LayoutContainer, Mesh });

  const resolvedNewColour = new_colour !== 0x50846e ? new_colour : (new_color ?? color ?? tint ?? 0x50846e);
  const resolvedSpecialColour = special_colour !== null ? special_colour : (special_color ?? null);
  const resolvedTertiaryColour = tertiary_colour !== null ? tertiary_colour : (tertiary_color ?? null);
  const resolvedAlpha = alpha !== 1.0 ? alpha : (opacity ?? 1.0);

  // Calibrate background animation to match Balatro's calm standard state.
  // In Balatro, the background only spins (spin_amount > 0) during Boss Blinds.
  // Standard rounds, menus, shops, packs, and won states have spin_amount = 0 and a slower speed.
  const isShowdown = resolvedNewColour === 0x009DFF && resolvedSpecialColour === 0xFE5F55;
  const isBossBlind = (resolvedSpecialColour !== null &&
    resolvedSpecialColour !== 0x000000 &&
    resolvedSpecialColour !== 0x2C3536 &&
    resolvedNewColour !== 0x2C3536) || isShowdown;

  const finalSpinAmount = isShowdown ? 1.0 : (isBossBlind ? 0.3 : spin_amount);
  const finalSpeed = speed; // Use speed directly from presets or default (1.0) to match Balatro's speed

  const shader = useMemo(() => new BackgroundShader({
    new_colour: resolvedNewColour,
    special_colour: resolvedSpecialColour,
    tertiary_colour: resolvedTertiaryColour,
    contrast,
    spin_amount: finalSpinAmount,
    scale,
    speed: finalSpeed,
    alpha: resolvedAlpha
  }), // eslint-disable-next-line @eslint-react/exhaustive-deps
  []);

  // Create a reusable unit quad geometry (positions 0-1, UVs 0-1)
  const geometry = useMemo(() => new MeshGeometry({
    positions: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  }), []);

  useEffect(() => {
    shader.new_colour = resolvedNewColour;
  }, [shader, resolvedNewColour]);

  useEffect(() => {
    shader.special_colour = resolvedSpecialColour;
  }, [shader, resolvedSpecialColour]);

  useEffect(() => {
    shader.tertiary_colour = resolvedTertiaryColour;
  }, [shader, resolvedTertiaryColour]);

  useEffect(() => {
    shader.contrast = contrast;
  }, [shader, contrast]);

  useEffect(() => {
    shader.spin_amount = finalSpinAmount;
  }, [shader, finalSpinAmount]);

  useEffect(() => {
    shader.scale = scale;
  }, [shader, scale]);

  useEffect(() => {
    shader.speed = finalSpeed;
  }, [shader, finalSpeed]);

  useEffect(() => {
    shader.alpha = resolvedAlpha;
  }, [shader, resolvedAlpha]);

  useEffect(() => {
    return () => {
      shader.destroy();
      geometry.destroy();
    };
  }, [shader, geometry]);

  return (
    <pixiLayoutContainer
      layout={{ position: 'absolute', width: '100%', height: '100%' }}
      onLayout={(event) => {
        const { width, height } = event.target.layout._computedLayout;
        shader.updateResolution(width, height);
      }}
      {...props}
    >
      <pixiMesh
        geometry={geometry}
        shader={shader}
        texture={Texture.EMPTY}
        layout={{ width: '100%', height: '100%', flex: 1 }}
      />
    </pixiLayoutContainer>
  );
};

Background.displayName = 'Background';

export default Background;
