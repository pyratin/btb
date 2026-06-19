import { Filter, GlProgram, Ticker, UniformGroup } from 'pixi.js';

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

// An authentic, premium Balatro CRT shader matching the game's commercial GLSL code.
const fragment = `
  precision highp float;

  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform vec4 uInputSize;

  uniform float u_time;
  uniform vec2 u_distortion_fac;
  uniform vec2 u_scale_fac;
  uniform float u_feather_fac;
  uniform float u_noise_fac;
  uniform float u_bloom_fac;
  uniform float u_crt_intensity;
  uniform float u_glitch_intensity;
  uniform float u_scanlines;

  #define BUFF 0.01
  #define BLOOM_AMT 3

  void main() {
      vec2 love_ScreenSize = uInputSize.xy;
      vec2 tc = vTextureCoord;

      // Keep the original texture coords
      vec2 orig_tc = tc;

      // recenter
      tc = tc * 2.0 - vec2(1.0);
      tc *= u_scale_fac;

      // bulge from middle (curved screen glass math)
      tc += (tc.yx * tc.yx) * tc * (u_distortion_fac - 1.0);

      // smoothly transition the edge to black (vignette border)
      float mask = (1.0 - smoothstep(1.0 - u_feather_fac, 1.0, abs(tc.x) - BUFF))
                 * (1.0 - smoothstep(1.0 - u_feather_fac, 1.0, abs(tc.y) - BUFF));

      // undo recenter
      tc = (tc + vec2(1.0)) / 2.0;

      // Create the horizontal glitch offset effects
      float offset_l = 0.0;
      float offset_r = 0.0;
      if (u_glitch_intensity > 0.01) {
          float timefac = 3.0 * u_time;
          offset_l = 50.0 * (-3.5 + sin(timefac * 0.512 + tc.y * 40.0)
                  + sin(-timefac * 0.8233 + tc.y * 81.532)
                  + sin(timefac * 0.333 + tc.y * 30.3)
                  + sin(-timefac * 0.1112331 + tc.y * 13.0));
          offset_r = -50.0 * (-3.5 + sin(timefac * 0.6924 + tc.y * 29.0)
                  + sin(-timefac * 0.9661 + tc.y * 41.532)
                  + sin(timefac * 0.4423 + tc.y * 40.3)
                  + sin(-timefac * 0.13321312 + tc.y * 11.0));

          if (u_glitch_intensity > 1.0) {
              offset_l = 50.0 * (-1.5 + sin(timefac * 0.512 + tc.y * 4.0)
                  + sin(-timefac * 0.8233 + tc.y * 1.532)
                  + sin(timefac * 0.333 + tc.y * 3.3)
                  + sin(-timefac * 0.1112331 + tc.y * 1.0));
              offset_r = -50.0 * (-1.5 + sin(timefac * 0.6924 + tc.y * 19.0)
                  + sin(-timefac * 0.9661 + tc.y * 21.532)
                  + sin(timefac * 0.4423 + tc.y * 20.3)
                  + sin(-timefac * 0.13321312 + tc.y * 5.0));
          }
          tc.x = tc.x + 0.001 * u_glitch_intensity * clamp(offset_l, clamp(offset_r, -1.0, 0.0), 1.0);
      }

      // Read texture color
      vec4 crt_tex = texture(uTexture, tc);

      // intensity multiplier for any visual artifacts
      float artifact_amplifier = (abs(clamp(offset_l, clamp(offset_r, -1.0, 0.0), 1.0)) * u_glitch_intensity > 0.9 ? 3.0 : 1.0);

      // Horizontal Chromatic Aberration
      float crt_amout_adjusted = (max(0.0, (u_crt_intensity) / (0.16 * 0.3))) * artifact_amplifier;
      if (crt_amout_adjusted > 0.0000001) {
          crt_tex.r = crt_tex.r * (1.0 - crt_amout_adjusted) + crt_amout_adjusted * texture(uTexture, tc + vec2(0.0005 * (1.0 + 10.0 * (artifact_amplifier - 1.0)) * 1600.0 / love_ScreenSize.x, 0.0)).r;
          crt_tex.g = crt_tex.g * (1.0 - crt_amout_adjusted) + crt_amout_adjusted * texture(uTexture, tc + vec2(-0.0005 * (1.0 + 10.0 * (artifact_amplifier - 1.0)) * 1600.0 / love_ScreenSize.x, 0.0)).g;
      }
      vec3 rgb_result = crt_tex.rgb * (1.0 - (1.0 * u_crt_intensity * artifact_amplifier));

      // post processing on the glitch effect to amplify green or red for a few lines of pixels
      if (sin(u_time + tc.y * 200.0) > 0.85) {
          if (offset_l < 0.99 && offset_l > 0.01) rgb_result.r = rgb_result.g * 1.5;
          if (offset_r > -0.99 && offset_r < -0.01) rgb_result.g = rgb_result.r * 1.5;
      }

      // Add the pixel scanline overlay
      vec3 rgb_scanline = 1.0 * vec3(
          clamp(-0.3 + 2.0 * sin(tc.y * u_scanlines - 3.14 / 4.0) - 0.8 * clamp(sin(tc.x * u_scanlines * 4.0), 0.4, 1.0), -1.0, 2.0),
          clamp(-0.3 + 2.0 * cos(tc.y * u_scanlines) - 0.8 * clamp(cos(tc.x * u_scanlines * 4.0), 0.0, 1.0), -1.0, 2.0),
          clamp(-0.3 + 2.0 * cos(tc.y * u_scanlines - 3.14 / 3.0) - 0.8 * clamp(cos(tc.x * u_scanlines * 4.0 - 3.14 / 4.0), 0.0, 1.0), -1.0, 2.0)
      );

      rgb_result += crt_tex.rgb * rgb_scanline * u_crt_intensity * artifact_amplifier;

      // Add noise
      float x = (tc.x - mod(tc.x, 0.002)) * (tc.y - mod(tc.y, 0.0013)) * u_time * 1000.0;
      x = mod(x, 13.0) * mod(x, 123.0);
      float dx = mod(x, 0.11) / 0.11;
      rgb_result = (1.0 - clamp(u_noise_fac * artifact_amplifier, 0.0, 1.0)) * rgb_result + dx * clamp(u_noise_fac * artifact_amplifier, 0.0, 1.0) * vec3(1.0, 1.0, 1.0);

      // Contrast and brightness correction
      rgb_result -= vec3(0.55 - 0.02 * (artifact_amplifier - 1.0 - crt_amout_adjusted * u_bloom_fac * 0.7));
      rgb_result = rgb_result * (1.0 + 0.14 + crt_amout_adjusted * (0.012 - u_bloom_fac * 0.12));
      rgb_result += vec3(0.5);

      vec4 final_col = vec4(rgb_result * 1.0, 1.0);

      // Bloom filter
      vec4 col = vec4(0.0);
      float bloom = 0.0;

      if (u_bloom_fac > 0.00001 && u_crt_intensity > 0.000001) {
          bloom = 0.03 * (max(0.0, (u_crt_intensity) / (0.16 * 0.3)));
          float bloom_dist = 0.0015 * float(BLOOM_AMT);
          vec4 samp;
          float cutoff = 0.6;

          for (int i = -BLOOM_AMT; i <= BLOOM_AMT; ++i) {
              for (int j = -BLOOM_AMT; j <= BLOOM_AMT; ++j) {
                  samp = texture(uTexture, tc + (bloom_dist / float(BLOOM_AMT)) * vec2(float(i), float(j)));
                  samp.r = max(1.0 / (1.0 - cutoff) * samp.r - 1.0 / (1.0 - cutoff) + 1.0, 0.0);
                  samp.g = max(1.0 / (1.0 - cutoff) * samp.g - 1.0 / (1.0 - cutoff) + 1.0, 0.0);
                  samp.b = max(1.0 / (1.0 - cutoff) * samp.b - 1.0 / (1.0 - cutoff) + 1.0, 0.0);
                  col += min(min(samp.r, samp.g), samp.b) * (2.0 - abs(float(i + j)) / float(BLOOM_AMT + BLOOM_AMT));
              }
          }

          col /= float(BLOOM_AMT * BLOOM_AMT);
          col.a = final_col.a;
      }

      finalColor = (final_col * (1.0 - 1.0 * bloom) + bloom * col) * mask;
  }
`;

/**
 * CRT - Authentic Balatro CRT television monitor filter. Incorporates curved
 * glass distortion, scanlines, aberration, noise, and bloom.
 */
export default class CRT extends Filter {
  /** @type {((ticker: import('pixi.js').Ticker) => void) | null} */
  _tickerCallback = null;

  /** @type {UniformGroup} */
  _uniforms;

  /**
   * @typedef {object} CRTOptions
   * @property {number} [intensity] Convenience slider from 0.0 to 1.0. Scales
   *   all CRT parameters proportionally (default: 0.1).
   * @property {number[]} [distortion_fac] Curved distortion vector (C)
   *   (default: [1.07, 1.10]).
   * @property {number[]} [scale_fac] Border margins scale vector (default:
   *   [0.992, 0.992]).
   * @property {number} [feather_fac] Monitor edge blur factor (default: 0.01).
   * @property {number} [noise_fac] Grain noise intensity (default: 0.001).
   * @property {number} [bloom_fac] Phosphor bloom glow strength (default: 0.0).
   * @property {number} [crt_intensity] Scanline base intensity opacity
   *   (default: 0.16, clamped to max 0.16).
   * @property {number} [glitch_intensity] Chromatic glitch split factor
   *   (default: 0.0).
   * @property {number} [scanlines] Total Scanlines frequency (default: 540.0).
   */

  /** @param {CRTOptions} [options] Filter configuration options. */
  constructor(options = {}) {
    let intensity = 0.1; // Default to 0.1 so subtle CRT is active by default
    let distortion_fac = [1.07, 1.1];
    let scale_fac = [0.992, 0.992];
    let feather_fac = 0.01;
    let noise_fac = 0.001;
    let bloom_fac = 0.0;
    let crt_intensity = 0.16; // Balatro's base crt_intensity
    let glitch_intensity = 0.0;
    let scanlines = 540.0;

    if (options && typeof options === 'object') {
      if (options.intensity !== undefined) intensity = options.intensity;
      if (options.distortion_fac !== undefined)
        distortion_fac = options.distortion_fac;
      if (options.scale_fac !== undefined) scale_fac = options.scale_fac;
      if (options.feather_fac !== undefined) feather_fac = options.feather_fac;
      if (options.noise_fac !== undefined) noise_fac = options.noise_fac;
      if (options.bloom_fac !== undefined) bloom_fac = options.bloom_fac;
      if (options.crt_intensity !== undefined)
        crt_intensity = options.crt_intensity;
      if (options.glitch_intensity !== undefined)
        glitch_intensity = options.glitch_intensity;
      if (options.scanlines !== undefined) scanlines = options.scanlines;
    }

    // Initialize uniforms with scaling based on the overall intensity slider
    const shaderUniforms = new UniformGroup({
      u_time: { value: 0.0, type: 'f32' },
      u_distortion_fac: {
        value: [
          1.0 + (distortion_fac[0] - 1.0) * intensity,
          1.0 + (distortion_fac[1] - 1.0) * intensity
        ],
        type: 'vec2<f32>'
      },
      u_scale_fac: {
        value: [
          1.0 - (1.0 - scale_fac[0]) * intensity,
          1.0 - (1.0 - scale_fac[1]) * intensity
        ],
        type: 'vec2<f32>'
      },
      u_feather_fac: { value: feather_fac, type: 'f32' },
      u_noise_fac: { value: noise_fac * intensity, type: 'f32' },
      u_bloom_fac: { value: bloom_fac, type: 'f32' },
      u_crt_intensity: { value: crt_intensity * intensity, type: 'f32' },
      u_glitch_intensity: { value: glitch_intensity, type: 'f32' },
      u_scanlines: { value: scanlines, type: 'f32' }
    });

    super({
      glProgram: GlProgram.from({
        vertex,
        fragment
      }),
      resources: {
        shaderUniforms
      },
      resolution: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      antialias: true
    });

    this._uniforms = shaderUniforms;

    // Auto-animate time using global shared ticker
    let elapsedSeconds = 0;
    this._tickerCallback = (ticker) => {
      elapsedSeconds += ticker.deltaTime / 60;
      this._uniforms.uniforms.u_time = elapsedSeconds;
    };

    Ticker.shared.add(this._tickerCallback);
  }

  /**
   * Curved Distortion Vector Getter/Setter.
   *
   * @returns {number[]} The [x, y] glass distortion curvature factor.
   */
  get distortion_fac() {
    return /** @type {number[]} */ (this._uniforms.uniforms.u_distortion_fac);
  }

  /** @param {number[]} value - The distortion fac [x, y]. */
  set distortion_fac(value) {
    this._uniforms.uniforms.u_distortion_fac = value;
  }

  /**
   * Screen scale compensation Getter/Setter.
   *
   * @returns {number[]} The [x, y] scale margin compensation factor.
   */
  get scale_fac() {
    return /** @type {number[]} */ (this._uniforms.uniforms.u_scale_fac);
  }

  /** @param {number[]} value - The scale compensation fac [x, y]. */
  set scale_fac(value) {
    this._uniforms.uniforms.u_scale_fac = value;
  }

  /**
   * Feather Border Blur Getter/Setter.
   *
   * @returns {number} The vignette feather blur size.
   */
  get feather_fac() {
    return /** @type {number} */ (this._uniforms.uniforms.u_feather_fac);
  }

  /** @param {number} value - The vignette feather size. */
  set feather_fac(value) {
    this._uniforms.uniforms.u_feather_fac = value;
  }

  /**
   * Noise Intensity Getter/Setter.
   *
   * @returns {number} The noise grain opacity.
   */
  get noise_fac() {
    return /** @type {number} */ (this._uniforms.uniforms.u_noise_fac);
  }

  /** @param {number} value - The noise grain opacity. */
  set noise_fac(value) {
    this._uniforms.uniforms.u_noise_fac = value;
  }

  /**
   * Bloom strength Getter/Setter.
   *
   * @returns {number} The phosphor bloom glow amount.
   */
  get bloom_fac() {
    return /** @type {number} */ (this._uniforms.uniforms.u_bloom_fac);
  }

  /** @param {number} value - The phosphor bloom bleed. */
  set bloom_fac(value) {
    this._uniforms.uniforms.u_bloom_fac = value;
  }

  /**
   * CRT Base Scanline Intensity Getter/Setter.
   *
   * @returns {number} The scanline base opacity.
   */
  get crt_intensity() {
    return /** @type {number} */ (this._uniforms.uniforms.u_crt_intensity);
  }

  /** @param {number} value - The scanline opacity. */
  set crt_intensity(value) {
    this._uniforms.uniforms.u_crt_intensity = Math.min(
      0.16,
      Math.max(0.0, value)
    );
  }

  /**
   * Glitch split intensity Getter/Setter.
   *
   * @returns {number} The screen glitch horizontal displacement value.
   */
  get glitch_intensity() {
    return /** @type {number} */ (this._uniforms.uniforms.u_glitch_intensity);
  }

  /** @param {number} value - The screen glitch factor. */
  set glitch_intensity(value) {
    this._uniforms.uniforms.u_glitch_intensity = value;
  }

  /**
   * Scanline Frequency Getter/Setter.
   *
   * @returns {number} The total scanlines frequency count.
   */
  get scanlines() {
    return /** @type {number} */ (this._uniforms.uniforms.u_scanlines);
  }

  /** @param {number} value - The scanlines count. */
  set scanlines(value) {
    this._uniforms.uniforms.u_scanlines = value;
  }

  /** Teardown filter subscriptions on unmount to prevent leaks. */
  destroy() {
    if (this._tickerCallback) {
      Ticker.shared.remove(this._tickerCallback);
      this._tickerCallback = null;
    }
    super.destroy();
  }
}
