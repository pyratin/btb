import { Assets } from 'pixi.js';
import _ from 'lodash';

import bundleDefinition from '#browser/component/definition/bundle.json';

const textureScaledGet = (texture, factor = 1.5) => {
  const keyCollection = ['orig', 'trim'];

  keyCollection.map(
    (key) =>
      texture?.[key] &&
      Object.assign(texture[key], {
        ...['width', 'height', 'x', 'y'].reduce(
          (memo, prop) => ({
            ...memo,
            [prop]: texture[key][prop] * factor
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

const textureHandledGet = (asset) => {
  switch (true) {
    case !asset:
      return asset;

    case !!asset.orig:
      return textureScaledGet(asset);

    case _.isObject(asset):
      return Object.entries(asset).reduce((memo, [key, value]) => {
        return {
          ...memo,
          [key]: textureScaledGet(value)
        };
      }, {});

    default:
      return asset;
  }
};

export default async () => {
  Assets.init({
    manifest: {
      bundles: Object.entries(bundleDefinition).map(([name, value]) => ({
        name,
        assets: value.map(({ alias, src, extension, ...rest }) => ({
          ...rest,
          alias,
          src: `/asset/${src}/${alias}.${extension}`
        }))
      }))
    }
  });

  Assets.backgroundLoadBundle(Object.keys(bundleDefinition));

  return await Promise.all(
    Object.entries(bundleDefinition).map(([key, value]) =>
      Assets.loadBundle(key).then((bundle) =>
        Object.fromEntries(
          value.map(({ alias, extension }) => [
            alias,
            (() => {
              const asset = bundle[alias];

              switch (key) {
                case 'image':
                  return textureHandledGet(
                    extension === 'json' ? asset.textures : asset
                  );

                case 'font':
                  return asset;
              }
            })()
          ])
        )
      )
    )
  ).then((result) => {
    return result.reduce(
      (memo, _result) => ({
        ...memo,
        ..._result
      }),
      {}
    );
  });
};
