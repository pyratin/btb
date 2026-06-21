import _ from 'lodash';

import bundleDefinition from '#browser/component/definition/bundle.json';

const textureClonedGet = (texture) => {
  switch (true) {
    case !texture:
      return texture;

    default:
      return new texture.constructor({
        source: texture.source,
        frame: texture.frame,
        orig: Object.assign(Object.create(texture.orig)),
        trim: (() => {
          switch (true) {
            case !texture.trim:
              return undefined;

            default:
              return Object.assign(Object.create(texture.trim));
          }
        })(),
        rotate: texture.rotate,
        defaultAnchor: texture.defaultAnchor
      });
  }
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
