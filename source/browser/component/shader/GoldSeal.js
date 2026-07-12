import { Filter, GlProgram, Ticker, UniformGroup } from 'pixi.js';

export default class GoldSeal extends Filter {
  static vertex = `precision highp float;
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
}`;

  static fragment = `precision highp float;
in vec2 vTextureCoord;
in vec2 vLocalCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform float u_time;
void main() {
    vec4 pixel = texture(uTexture, vTextureCoord);
    float delta = max(pixel.r, max(pixel.g, pixel.b)) * 0.4;
    float fac = pow(max(sin((vLocalCoord.x + vLocalCoord.y) * 6.0 - u_time * 2.0), 0.0), 2.0);
    pixel.r = max(pixel.r, (pixel.a - pixel.r) * delta * fac * 1.5 + pixel.r);
    pixel.g = max(pixel.g, (pixel.a - pixel.g) * delta * fac * 1.2 + pixel.g);
    pixel.b = max(pixel.b, (pixel.a - pixel.b) * delta * fac * 0.4 + pixel.b);
    finalColor = pixel;
}`;

  constructor() {
    const shaderUniforms = new UniformGroup({
      u_time: { value: 0.0, type: 'f32' }
    });

    super({
      glProgram: GlProgram.from({
        vertex: GoldSeal.vertex,
        fragment: GoldSeal.fragment
      }),
      resources: {
        shaderUniforms
      },
      resolution: 1.0,
      antialias: true
    });

    this._uniforms = shaderUniforms;
    this._randomOffset = Math.random() * 1000.0;
    let elapsedSeconds = 0;

    this._tickerCallback = (ticker) => {
      elapsedSeconds += ticker.deltaTime / 60;
      this._uniforms.uniforms.u_time = elapsedSeconds + this._randomOffset;
    };

    Ticker.shared.add(this._tickerCallback);
  }

  destroy() {
    switch (true) {
      case !!this._tickerCallback:
        Ticker.shared.remove(this._tickerCallback);
        this._tickerCallback = null;
        break;
    }
    super.destroy();
  }
}
