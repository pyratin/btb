import { Assets } from 'pixi.js';

import bundleDefinition from '#browser/component/definition/bundle.json';

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
        Object.fromEntries(value.map(({ alias }) => [alias, bundle[alias]]))
      )
    )
  ).then((_result) => {
    return _result.reduce(
      (memo, result) => ({
        ...memo,
        ...result
      }),
      {}
    );
  });
};
