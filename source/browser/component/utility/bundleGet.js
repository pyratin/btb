import _ from 'lodash';

import bundleDefinition from '#browser/component/definition/bundle.json';

const textureClonedGet = (texture) => {
  if (!texture) return texture;

  // 1. Shadow-clone the main texture
  const cloned = Object.create(texture);

  // 2. Shadow-clone the layout rectangles to keep original coordinates pure
  if (texture.orig) {
    cloned.orig = Object.create(texture.orig);
  }
  if (texture.trim) {
    cloned.trim = Object.create(texture.trim);
  }

  // 3. Shadow-clone the style configurations
  if (texture.source) {
    cloned.source = Object.create(texture.source);
    if (texture.source.style) {
      cloned.source.style = Object.create(texture.source.style);
    }
  }

  return cloned;
};

const textureScaledGet = (_texture, factor) => {
  const keyCollection = ['orig', 'trim'];

  const texture = textureClonedGet(_texture);

  keyCollection.map(
    (key) =>
      texture?.[key] &&
      Object.assign(texture[key], {
        ...['width', 'height', 'x', 'y'].reduce(
          (memo, prop) => ({
            ...memo,
            [prop]: _texture[key][prop] * factor
          }),
          {}
        )
      })
  );

  // Example settings to apply on loaded textures:
  texture.source.style.scaleMode = 'linear';

  texture.source.style.mipmap = true; // Enables smooth downscaling

  return texture;
};

const textureHandledGet = (asset, factor) => {
  switch (true) {
    case !asset:
      return asset;

    case !!asset.orig:
      return textureScaledGet(asset, factor);

    case _.isObject(asset):
      return Object.entries(asset).reduce((memo, [key, value]) => {
        return {
          ...memo,
          [key]: textureScaledGet(value, factor)
        };
      }, {});

    default:
      return asset;
  }
};

export default (_bundle, factor) => {
  return Object.entries(bundleDefinition)
    .map(([key, value]) =>
      Object.fromEntries(
        value.map(({ alias, extension }) => [
          alias,
          (() => {
            const asset = _bundle[alias];

            switch (key) {
              case 'image':
                return textureHandledGet(
                  extension === 'json' ? asset.textures : asset,
                  factor
                );

              case 'font':
                return asset;
            }
          })()
        ])
      )
    )
    .reduce(
      (memo, result) => ({
        ...memo,
        ...result
      }),
      {}
    );
};
