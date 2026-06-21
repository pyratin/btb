/* eslint-disable @eslint-react/no-children-only, @eslint-react/no-clone-element */
import { useEffect, useMemo, useRef, Children, cloneElement } from 'react';
import { Filter, GlProgram, Ticker, UniformGroup } from 'pixi.js';
import '@pixi/layout';

// Standard PixiJS v8 WebGL2/GLSL 300 es vertex shader with explicit precision.
const vertex = `
  precision highp float;

  in vec2 aPosition;
  out vec2 vTextureCoord;
  out vec2 vLocalCoord;

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
      vLocalCoord = aPosition;
  }
`;

// 1. Folio (Metallic Sheen) Fragment Shader
const folioFragment = `
  precision highp float;

  in vec2 vTextureCoord;
  in vec2 vLocalCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float u_time;
  uniform vec2 u_effect_vector;
  uniform float u_hover;
  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;

  void main() {
      vec4 texel = texture(uTexture, vTextureCoord);
      if (texel.a == 0.0) {
          discard;
      }

      // Unpremultiply color for accurate math
      vec4 straightTexel = vec4(texel.rgb / texel.a, texel.a);

      // Local UV ranging from 0.0 to 1.0 within card bounds
      vec2 uv = vLocalCoord;
      vec2 adjusted_uv = uv - vec2(0.5, 0.5);
      adjusted_uv.x = adjusted_uv.x * (uOutputFrame.z / uOutputFrame.w);

      float low = min(straightTexel.r, min(straightTexel.g, straightTexel.b));
      float high = max(straightTexel.r, max(straightTexel.g, straightTexel.b));
      float delta = min(high, max(0.5, 1.0 - low));

      vec2 foil = u_effect_vector;

      float fac = max(min(2.0 * sin((length(90.0 * adjusted_uv) + foil.x * 2.0) + 3.0 * (1.0 + 0.8 * cos(length(113.1121 * adjusted_uv) - foil.x * 3.121))) - 1.0 - max(5.0 - length(90.0 * adjusted_uv), 0.0), 1.0), 0.0);
      vec2 rotater = vec2(cos(foil.x * 0.1221), sin(foil.x * 0.3512));
      float angle = dot(rotater, adjusted_uv) / (length(rotater) * length(adjusted_uv) + 0.0001);
      float fac2 = max(min(5.0 * cos(foil.y * 0.3 + angle * 3.14159 * (2.2 + 0.9 * sin(foil.x * 1.65 + 0.2 * foil.y))) - 4.0 - max(2.0 - length(20.0 * adjusted_uv), 0.0), 1.0), 0.0);
      float fac3 = 0.3 * max(min(2.0 * sin(foil.x * 5.0 + uv.x * 3.0 + 3.0 * (1.0 + 0.5 * cos(foil.x * 7.0))) - 1.0, 1.0), -1.0);
      float fac4 = 0.3 * max(min(2.0 * sin(foil.x * 6.66 + uv.y * 3.8 + 3.0 * (1.0 + 0.5 * cos(foil.x * 3.414))) - 1.0, 1.0), -1.0);

      float maxfac = max(max(fac, max(fac2, max(fac3, max(fac4, 0.0)))) + 2.2 * (fac + fac2 + fac3 + fac4), 0.0);

      vec3 texRgb;
      texRgb.r = straightTexel.r - delta + delta * maxfac * 0.3;
      texRgb.g = straightTexel.g - delta + delta * maxfac * 0.3;
      texRgb.b = straightTexel.b + delta * maxfac * 1.9;

      // Replicate the exact Love2D alpha modulation but blended over the original opaque card base
      float blendAlpha = min(straightTexel.a, 0.3 * straightTexel.a + 0.9 * min(0.5, maxfac * 0.1));

      // Apply strong blend while keeping the beautiful base sheen active
      float activeBlend = clamp(blendAlpha, 0.0, 1.0);
      vec3 finalRgb = mix(straightTexel.rgb, texRgb, activeBlend);
      
      // Preserve clean card edges and perfect card opacity
      finalColor = vec4(finalRgb * straightTexel.a, straightTexel.a);
  }
`;

// 2. Holographic (Rainbow Hue-Shift) Fragment Shader
const holoFragment = `
  precision highp float;

  in vec2 vTextureCoord;
  in vec2 vLocalCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float u_time;
  uniform vec2 u_effect_vector;
  uniform float u_hover;
  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;

  float hue(float s, float t, float h) {
      float hs = mod(h, 1.0) * 6.0;
      if (hs < 1.0) return (t - s) * hs + s;
      if (hs < 3.0) return t;
      if (hs < 4.0) return (t - s) * (4.0 - hs) + s;
      return s;
  }

  vec4 RGB(vec4 c) {
      if (c.y < 0.0001) {
          return vec4(vec3(c.z), c.a);
      }
      float t = (c.z < 0.5) ? c.y * c.z + c.z : -c.y * c.z + (c.y + c.z);
      float s = 2.0 * c.z - t;
      return vec4(hue(s, t, c.x + 1.0 / 3.0), hue(s, t, c.x), hue(s, t, c.x - 1.0 / 3.0), c.a);
  }

  vec4 HSL(vec4 c) {
      float low = min(c.r, min(c.g, c.b));
      float high = max(c.r, max(c.g, c.b));
      float delta = high - low;
      float sum = high + low;

      vec4 hsl = vec4(0.0, 0.0, 0.5 * sum, c.a);
      if (delta == 0.0) {
          return hsl;
      }

      hsl.y = (hsl.z < 0.5) ? delta / sum : delta / (2.0 - sum);

      if (high == c.r) {
          hsl.x = (c.g - c.b) / delta;
      } else if (high == c.g) {
          hsl.x = (c.b - c.r) / delta + 2.0;
      } else {
          hsl.x = (c.r - c.g) / delta + 4.0;
      }

      hsl.x = mod(hsl.x / 6.0, 1.0);
      return hsl;
  }

  void main() {
      vec4 texel = texture(uTexture, vTextureCoord);
      if (texel.a == 0.0) {
          discard;
      }

      // Unpremultiply color for accurate math
      vec4 straightTexel = vec4(texel.rgb / texel.a, texel.a);

      // Local UV ranging from 0.0 to 1.0 within card bounds
      vec2 uv = vLocalCoord;
      
      // Snap to canonical Balatro card resolution (71x95)
      vec2 card_size = vec2(71.0, 95.0);
      vec2 floored_uv = floor(uv * card_size) / card_size;
      vec2 uv_scaled_centered = (floored_uv - vec2(0.5, 0.5)) * 250.0;

      // HSL calculation with 50% card, 50% blue
      vec4 hsl = HSL(0.5 * straightTexel + 0.5 * vec4(0.0, 0.0, 1.0, straightTexel.a));

      vec2 holo = u_effect_vector;
      float t = holo.y * 7.221 + u_time;

      vec2 field_part1 = uv_scaled_centered + 50.0 * vec2(sin(-t / 143.6340), cos(-t / 99.4324));
      vec2 field_part2 = uv_scaled_centered + 50.0 * vec2(cos(t / 53.1532), cos(t / 61.4532));
      vec2 field_part3 = uv_scaled_centered + 50.0 * vec2(sin(-t / 87.53218), sin(-t / 49.0000));

      float field = (1.0 + (
          cos(length(field_part1) / 19.483) + sin(length(field_part2) / 33.155) * cos(field_part2.y / 15.73) +
          cos(length(field_part3) / 27.193) * sin(field_part3.x / 21.92)
      )) / 2.0;

      float res = 0.5 + 0.5 * cos(holo.x * 2.612 + (field - 0.5) * 3.14159);

      float low = min(straightTexel.r, min(straightTexel.g, straightTexel.b));
      float high = max(straightTexel.r, max(straightTexel.g, straightTexel.b));
      
      // Amplified holographic intensity factors
      float delta = 0.2 + 0.3 * (high - low) + 0.1 * high;

      float gridsize = 0.79;
      float fac = 0.5 * max(
          max(
              max(0.0, 7.0 * abs(cos(uv.x * gridsize * 20.0)) - 6.0),
              max(0.0, 7.0 * cos(uv.y * gridsize * 45.0 + uv.x * gridsize * 20.0) - 6.0)
          ),
          max(0.0, 7.0 * cos(uv.y * gridsize * 45.0 - uv.x * gridsize * 20.0) - 6.0)
      );

      // Boost saturation and brightness of HSL for high-contrast visibility
      hsl.x = hsl.x + res + fac;
      hsl.y = hsl.y * 1.3;
      hsl.z = hsl.z * 0.6 + 0.4;

      vec3 holoColor = RGB(hsl).rgb * vec3(0.9, 0.8, 1.2);
      
      // Exact Balatro blend
      float active_delta = clamp(delta, 0.0, 0.95);
      vec3 finalRgb = mix(straightTexel.rgb, holoColor, active_delta);

      // Preserve clean card edges and opaque face
      finalColor = vec4(finalRgb * straightTexel.a, straightTexel.a);
  }
`;

// 3. Polychrome (Prismatic Color Spectrum) Fragment Shader
const polyFragment = `
  precision highp float;

  in vec2 vTextureCoord;
  in vec2 vLocalCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float u_time;
  uniform vec2 u_effect_vector;
  uniform float u_hover;
  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;

  float hue(float s, float t, float h) {
      float hs = mod(h, 1.0) * 6.0;
      if (hs < 1.0) return (t - s) * hs + s;
      if (hs < 3.0) return t;
      if (hs < 4.0) return (t - s) * (4.0 - hs) + s;
      return s;
  }

  vec4 RGB(vec4 c) {
      if (c.y < 0.0001) {
          return vec4(vec3(c.z), c.a);
      }
      float t = (c.z < 0.5) ? c.y * c.z + c.z : -c.y * c.z + (c.y + c.z);
      float s = 2.0 * c.z - t;
      return vec4(hue(s, t, c.x + 1.0 / 3.0), hue(s, t, c.x), hue(s, t, c.x - 1.0 / 3.0), c.a);
  }

  vec4 HSL(vec4 c) {
      float low = min(c.r, min(c.g, c.b));
      float high = max(c.r, max(c.g, c.b));
      float delta = high - low;
      float sum = high + low;

      vec4 hsl = vec4(0.0, 0.0, 0.5 * sum, c.a);
      if (delta == 0.0) {
          return hsl;
      }

      hsl.y = (hsl.z < 0.5) ? delta / sum : delta / (2.0 - sum);

      if (high == c.r) {
          hsl.x = (c.g - c.b) / delta;
      } else if (high == c.g) {
          hsl.x = (c.b - c.r) / delta + 2.0;
      } else {
          hsl.x = (c.r - c.g) / delta + 4.0;
      }

      hsl.x = mod(hsl.x / 6.0, 1.0);
      return hsl;
  }

  void main() {
      vec4 texel = texture(uTexture, vTextureCoord);
      if (texel.a == 0.0) {
          discard;
      }

      // Unpremultiply color for accurate math
      vec4 straightTexel = vec4(texel.rgb / texel.a, texel.a);

      // Local UV ranging from 0.0 to 1.0 within card bounds
      vec2 uv = vLocalCoord;
      
      // Snap to canonical Balatro card resolution (71x95)
      vec2 card_size = vec2(71.0, 95.0);
      vec2 floored_uv = floor(uv * card_size) / card_size;
      vec2 uv_scaled_centered = (floored_uv - vec2(0.5, 0.5)) * 50.0;

      float low = min(straightTexel.r, min(straightTexel.g, straightTexel.b));
      float high = max(straightTexel.r, max(straightTexel.g, straightTexel.b));
      float delta = high - low;

      float saturation_fac = 1.0 - max(0.0, 0.05 * (1.1 - delta));

      vec4 hsl = HSL(vec4(straightTexel.r * saturation_fac, straightTexel.g * saturation_fac, straightTexel.b, straightTexel.a));

      vec2 polychrome = u_effect_vector;
      float t = polychrome.y * 2.221 + u_time;

      vec2 field_part1 = uv_scaled_centered + 50.0 * vec2(sin(-t / 143.6340), cos(-t / 99.4324));
      vec2 field_part2 = uv_scaled_centered + 50.0 * vec2(cos(t / 53.1532), cos(t / 61.4532));
      vec2 field_part3 = uv_scaled_centered + 50.0 * vec2(sin(-t / 87.53218), sin(-t / 49.0000));

      float field = (1.0 + (
          cos(length(field_part1) / 19.483) + sin(length(field_part2) / 33.155) * cos(field_part2.y / 15.73) +
          cos(length(field_part3) / 27.193) * sin(field_part3.x / 21.92)
      )) / 2.0;

      float res = 0.5 + 0.5 * cos(polychrome.x * 2.612 + (field - 0.5) * 3.14159);
      
      hsl.x = hsl.x + res + polychrome.y * 0.04;
      hsl.y = min(0.6, hsl.y + 0.5);

      vec3 polyColor = RGB(hsl).rgb;

      // Exact Balatro polychrome style with strong mix, keeping outlines crisp naturally through HSL math
      vec3 finalRgb = mix(straightTexel.rgb, polyColor, 0.9);

      // Preserve clean card edges and opaque face
      finalColor = vec4(finalRgb * straightTexel.a, straightTexel.a);
  }
`;

// 4. Negative Edition (Translucent Inverted Purple) Fragment Shader
const negativeFragment = `
  precision highp float;

  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float u_hover;

  void main() {
      vec4 texel = texture(uTexture, vTextureCoord);
      if (texel.a == 0.0) {
          discard;
      }

      // Unpremultiply color for math accuracy
      vec3 rgb = texel.rgb / texel.a;

      // 1. Invert colors to get negative look
      vec3 inverted = 1.0 - rgb;

      // 2. Shift towards deep purple/blue holographic hue
      vec3 purpleTint = vec3(0.18, 0.05, 0.32);
      vec3 finalRgb = mix(inverted, purpleTint, 0.5);

      // 3. Make negative cards semi-transparent (e.g., 60% alpha)
      float targetAlpha = 0.6;
      float activeAlpha = texel.a * targetAlpha;

      finalColor = vec4(finalRgb * activeAlpha, activeAlpha);
  }
`;

/**
 * Base Edition Filter class that encapsulates uniform management, self-ticking
 * elapsed time, and dynamic global pointer tilt tracking.
 */
class EditionFilter extends Filter {
  constructor(fragmentShader) {
    const shaderUniforms = new UniformGroup({
      u_time: { value: 0.0, type: 'f32' },
      u_effect_vector: { value: [0.0, 0.0], type: 'vec2<f32>' },
      u_hover: { value: 0.0, type: 'f32' }
    });

    super({
      glProgram: GlProgram.from({
        vertex,
        fragment: fragmentShader
      }),
      resources: {
        shaderUniforms
      }
    });

    this._uniforms = shaderUniforms;
    this._elapsedSeconds = 0;
    this._randomOffset = Math.random() * 1000.0;
    this._targetTiltX = 0;
    this._targetTiltY = 0;
    this._currentTiltX = 0;
    this._currentTiltY = 0;

    /** @type {import('pixi.js').Container | null} */
    this._targetContainer = null;
    this.isHovered = false;
    this._hoverIntensity = 0.0;

    this._onPointerMove = (e) => {
      const container = this._targetContainer;
      if (!container) return;

      // Find the first visible ancestor on the screen
      let visibleAncestor = container;
      let current = container;
      while (current) {
        if (current.visible) {
          visibleAncestor = current;
        }
        current = current.parent;
      }

      if (!visibleAncestor) return;

      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const globalX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const globalY = ((e.clientY - rect.top) / rect.height) * canvas.height;

      // Convert global coordinates to the visible ancestor's local space
      const localPos = visibleAncestor.toLocal({ x: globalX, y: globalY });
      const bounds = visibleAncestor.getLocalBounds();
      const w = bounds.width;
      const h = bounds.height;
      if (w <= 0 || h <= 0) return;

      // Normalize pointer coordinates relative to the center (-1 to 1)
      const nx = (localPos.x - w / 2) / (w / 2);
      const ny = (localPos.y - h / 2) / (h / 2);

      // Clamp values
      const clampedNx = Math.max(-1, Math.min(1, nx));
      const clampedNy = Math.max(-1, Math.min(1, ny));

      this._targetTiltY = -clampedNx * 0.35;
      this._targetTiltX = clampedNy * 0.35;
    };

    window.addEventListener('pointermove', this._onPointerMove);

    this._tickerCallback = (ticker) => {
      this._elapsedSeconds += ticker.deltaTime / 60;

      const timeWithOffset = this._elapsedSeconds + this._randomOffset;
      this._uniforms.uniforms.u_time = timeWithOffset;

      let hovered = false;
      if (this._targetContainer) {
        // Walk up the parent chain to see if any parent (like the card wrapper) is scaled up on hover
        let current = this._targetContainer;
        while (current) {
          if (
            current.scale &&
            (current.scale.x > 1.01 || current.scale.y > 1.01)
          ) {
            hovered = true;
            break;
          }
          current = current.parent;
        }
      }

      if (!hovered) {
        this._targetTiltX = 0;
        this._targetTiltY = 0;
      }

      const targetHover = hovered ? 1.0 : 0.0;
      this._hoverIntensity += (targetHover - this._hoverIntensity) * 0.1;
      this._uniforms.uniforms.u_hover = this._hoverIntensity;

      const currentTargetX = this._targetTiltX * this._hoverIntensity;
      const currentTargetY = this._targetTiltY * this._hoverIntensity;

      this._currentTiltX += (currentTargetX - this._currentTiltX) * 0.08;
      this._currentTiltY += (currentTargetY - this._currentTiltY) * 0.08;

      const slowTime = timeWithOffset / 28.0;
      const tiltAmt = Math.sqrt(
        this._currentTiltX * this._currentTiltX +
          this._currentTiltY * this._currentTiltY
      );
      const componentX = slowTime + this._hoverIntensity * 0.15 + tiltAmt * 0.5;
      const componentY = timeWithOffset;

      this._uniforms.uniforms.u_effect_vector = [componentX, componentY];
    };

    Ticker.shared.add(this._tickerCallback);
  }

  get targetContainer() {
    return this._targetContainer;
  }

  set targetContainer(container) {
    this._targetContainer = container;
  }

  destroy() {
    window.removeEventListener('pointermove', this._onPointerMove);
    if (this._tickerCallback) {
      Ticker.shared.remove(this._tickerCallback);
      this._tickerCallback = null;
    }
    super.destroy();
  }
}

export class FolioFilter extends EditionFilter {
  constructor() {
    super(folioFragment);
  }
}

export class HolographicFilter extends EditionFilter {
  constructor() {
    super(holoFragment);
  }
}

export class PolychromeFilter extends EditionFilter {
  constructor() {
    super(polyFragment);
  }
}

export class NegativeFilter extends EditionFilter {
  constructor() {
    super(negativeFragment);
  }
}

/**
 * @typedef {object} EditionProps
 * @property {string} [type] The card edition type ('foil' | 'folio' |
 *   'holographic' | 'holo' | 'polychrome' | 'poly' | 'negative' | 'none').
 * @property {import('pixi.js').Filter[]} [filters] Optional array of input
 *   filters.
 * @property {import('react').ReactElement} children React child element.
 * @property {(e: import('pixi.js').FederatedPointerEvent) => void} [onPointerOver]
 *   Optional pointer over event handler.
 * @property {(e: import('pixi.js').FederatedPointerEvent) => void} [onPointerOut]
 *   Optional pointer out/leave event handler.
 */

const Edition = ({
  type,
  children,
  filters: incomingFilters = undefined,
  ref = undefined,
  ...props
}) => {
  const localRef = useRef(null);

  const filter = useMemo(() => {
    if (!type || type === 'none') {
      return null;
    }

    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'foil':
      case 'folio':
        return new FolioFilter();
      case 'holographic':
      case 'holo':
        return new HolographicFilter();
      case 'polychrome':
      case 'poly':
        return new PolychromeFilter();
      case 'negative':
        return new NegativeFilter();
      default:
        return null;
    }
  }, [type]);

  useEffect(() => {
    if (filter && localRef.current) {
      filter.targetContainer = localRef.current;
    }
  }, [filter]);

  useEffect(() => {
    return () => {
      if (filter) {
        filter.destroy();
      }
    };
  }, [filter]);

  const child = /** @type {import('react').ReactElement} */ (
    Children.only(children)
  );

  const activeFilters = useMemo(() => {
    const list = [];
    if (incomingFilters) list.push(...incomingFilters);
    if (child.props.filters) list.push(...child.props.filters);
    if (filter) list.push(filter);
    return list.length > 0 ? list : undefined;
  }, [incomingFilters, child.props.filters, filter]);

  return cloneElement(child, {
    ref: (el) => {
      localRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    filters: activeFilters,
    ...props
  });
};

Edition.displayName = 'Edition';

export default Edition;
